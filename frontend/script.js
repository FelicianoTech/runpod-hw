// Kick off separate requests for each image type so we can get work done in
// parallel.
async function generateImages() {

	requestImage("bluesky-image", 1500, 375);
	requestImage("x-image", 1500, 500);
	requestImage("facebook-image", 851, 315);
}

// Request a generated image from the RunPod endpoint. Reads the prompt
// directly from the UI. Uses the provided size and ID to know where to
// place the image.
async function requestImage( id, width, height ){

	prompt = document.getElementById("promptInput").value;
	prompt = "A " + prompt + " themed social media cover photo."

	if( !prompt ){
		alert("Please enter a prompt!");
		return;
	}

	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
			// I removed my token below
			authorization: "<RunPod API token>",
		},
		body: JSON.stringify({
			input: {
				prompt: prompt,
				width: width,
				height: height,
			},
		}),
	};

	try {
		const response = await fetch(
			// I Removed my endpoint ID below
			"https://api.runpod.ai/v2/<runpod-serverless-endpoint-id>/runsync",
			options,
		);

		const data = await response.json();

		if (data && data.output) {

			const imageBase64 = data.output;
			const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
			document.getElementById( id ).innerHTML =
				`<img src="${imageUrl}" alt="Generated Image">`;
		} else {
			alert("Failed to generate image");
		}
	} catch (error) {
		console.error("Error:", error);
		alert("Error generating image");
	}
}
