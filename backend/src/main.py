from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import httpx


async def on_fetch(request, env):
    import asgi

    return await asgi.fetch(app, request, env)


TEXT_GEN_MODEL = "@hf/meta-llama/meta-llama-3-8b-instruct"
IMAGE_GEN_MODEL = "@cf/black-forest-labs/flux-1-schnell"

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateTextRequest(BaseModel):
    content_name: str
    ending_description: str


class GenerateImageRequest(BaseModel):
    prompt: str
    content_name: str


def save_base64_image(json_response, filename):
    """
    Saves a base64 encoded image from a JSON response to a PNG file.

    Args:
        json_response (dict): The JSON response containing the base64 image data.
        filename (str, optional): The name of the file to save. Defaults to "output.png".
    """
    try:
        image_data_b64 = json_response['result']['image']
        image_data = base64.b64decode(image_data_b64)
        # save filename as time stamp      
        with open(filename, 'wb') as f:
            f.write(image_data)
        print(f"Image saved successfully to {filename}")
    except KeyError:
        print("Error: 'result' or 'image' key not found in the JSON response.")
    except base64.binascii.Error:
        print("Error: Invalid base64 encoded string.")
    except Exception as e:
        print(f"An error occurred: {e}")


async def generate_text_message(content_name: str, ending_description: str, req: Request):
    """
    Writes alternate ending of the given content.

    Args:
        content_name (str): The name of the TV show or movie.
        ending_description (str): The description of the alternative ending.

    Returns:
        str: A detailed prompt for image generation model.
    """
    messages = [
        {"role": "system", "content": """
            You are a specialized prompt engineer focused on creating detailed, photorealistic image generation prompts.
             When given a piece of media content (movie/show) and an alternative ending scenario, you will:

            Analyze the visual style of the original content
            Identify key visual elements that need to be preserved
            Create a detailed image generation prompt that maintains photorealism
            Include specific technical parameters for high-quality output

            Your output should follow this structure:
                SCENE DESCRIPTION: [Brief description of the alternative ending scene]
                IMAGE PROMPT: [Detailed prompt for image generation]
                VISUAL STYLE:
                    - Match content's color palette
                    - Maintain the content's cinematic wide shots
                    - Use natural lighting with strong shadows
                    - Incorporate the content's signature POV angles

                NEGATIVE PROMPT: long text, cartoon, anime, illustration, painting, digital art, artificial, low quality, blurry, deformed features, unrealistic lighting, hazmat suit, meth lab equipment, dark or dingy environment
                PARAMETERS:
                    - Style: Photorealistic
                    - Aspect Ratio: 16:9
                    - Quality: High detail, 8K
                    - Lighting: Natural, cinematic
                    - Camera: Wide angle, slight low angle
                    - Post-processing: Film grain, subtle color grading
                Note: Keep it short under 1000 characters."""
        },
        {"role": "user", "content": f"""
            Content Name: {content_name}
            Alternative Ending: {ending_description}"""}
    ]

    env = req.scope['env']
    CLOUDFLARE_API_KEY = env.CLOUDFLARE_API_KEY
    CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID
    API_BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/run/"

    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            text_response = await client.post(
                f"{API_BASE_URL}/{TEXT_GEN_MODEL}",
                headers=headers,
                json={"messages": messages},
                timeout=60.0  # timeout to prevent hanging

            )
        print("Text Response Status:", text_response.status_code)
        print("Text Response Content:", text_response.text)

        if text_response.status_code != 200:
            print(f"Text generation error: {text_response.text}")
            raise HTTPException(
                status_code=500, detail="Failed to generate text")

        response_json = text_response.json()
        generated_text = response_json["result"]["response"]
        return generated_text

    except Exception as e:
        print(f"Error in generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def generate_image(prompt: str, req: Request):
    env = req.scope['env']
    # API_BASE_URL = env.API_BASE_URL
    CLOUDFLARE_API_KEY = env.CLOUDFLARE_API_KEY
    CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID
    API_BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/run/"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_KEY}",
        "Content-Type": "application/json"
    }

    input_data = {"prompt": prompt, "steps": 8}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{API_BASE_URL}/{IMAGE_GEN_MODEL}", headers=headers, json=input_data, timeout=60.0)
    return response.json()


@app.post('/generate-text')
async def generate_ending(request_data: GenerateTextRequest, req: Request):
    try:
        prompt = await generate_text_message(
            content_name=request_data.content_name,
            ending_description=request_data.ending_description,
            req=req)
        return {"prompt": prompt, "content_name": request_data.content_name}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/generate-image')
async def generate_image_endpoint(request_data: GenerateImageRequest, req: Request):
    try:
        response = await generate_image(prompt=request_data.prompt, req=req)
        # save_base64_image(response, request_data.content_name)
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
