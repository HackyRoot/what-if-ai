I want you to create a beautiful frontend for the product called "WhatIf.ai" which helps you reimagine your favorite tv shows and movies ending as per your imagination.

It takes content name and ending description as text inputs and it should render image based on the base64 string.
First call text generation endpoint with content name and ending description to generate a detailed prompt for image generation model. Now show that generated prompt in a text box, under which add "generate image" button. Upon which call image generation model and get the base64 string. Which needs to rendered to png.

Entire frontend should be responsive.

API URL: https://what-if-ai.steveparmar6nov2011.workers.dev/

Text generation Endpoint: POST /generate-text
parameters
{
"content_name": "rick and morty",
"ending_description": "Rick and morty didn't fight and they had a happy healthy family"
}

returns
{
"prompt": "SCENE DESCRIPTION: Rick and Morty sitting on the couch ",
"content_name": "rick and morty"
}

Image generation Endpoint: POST /generate-image

parameters
{
"prompt": "SCENE DESCRIPTION: Rick and Morty sitting on the couch ",
"content_name": "rick and morty"
}

returns
{
"result": {
"image": "BASE64_image"
}
}
