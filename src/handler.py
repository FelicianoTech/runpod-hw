""" SDXL-Turbo backend. """

import runpod
from diffusers import AutoPipelineForText2Image
import torch
import base64
import io
import time

try:
    pipe = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sdxl-turbo",
        torch_dtype=torch.float16,
        variant="fp16",
    )
    pipe.to("cuda")
except RuntimeError:
    quit()

def handler(job):

    """ Handler function that will be used to process jobs. """
    job_input = job['input']
    prompt = job_input['prompt']
    imageWidth = job_input['width']
    imageHeight = job_input['height']

    # Normalize the image dimensions. They have to be divisible by 8.
    widthRemainder = imageWidth % 8
    heightRemainder = imageHeight % 8
    if widthRemainder != 0:
        imageWidth += 8 - widthRemainder
    if heightRemainder != 0:
        imageHeight += 8 - heightRemainder

    time_start = time.time()
    image = pipe(
        prompt=prompt,
        width=imageWidth,
        height=imageHeight,
        num_inference_steps=5,
        guidance_scale=0.0,
    ).images[0]

    print(f"Time taken: {time.time() - time_start}")

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    image_bytes = buffer.getvalue()

    return base64.b64encode(image_bytes).decode('utf-8')


runpod.serverless.start({"handler": handler})
