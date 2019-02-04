let lasttimestamp = Date.now();
const url =window.location.href;
let successiveFailures = 0;

const interval = setInterval(checkForNewImagesAndUpdate, 5000);

function checkForNewImagesAndUpdate() {
    const newImagesArray = checkForNewImages(lasttimestamp);
}

function checkForNewImages(timestamp) {
    successiveFailures++;
    if (successiveFailures > 2) {
        clearInterval(interval);
        document.getElementById('connection-lost').appendChild(document.createTextNode('Server Connection Lost'));
        return;
    }
    fetch('${url}latest' , {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({after: timestamp})
    }).then(response => response.json())
    .then(hydratedBody => {
        successiveFailures = 0;
        if (hydratedBody.images && hydratedBody.timestamp) {
            lastTimestamp = hydratedBody.timestamp;
            const arrayOfImagePaths = hydratedBody.images.reverse();
            for (let imagePath of arrayOfImagePaths) {
                const imageNode = document.createElement('img');
                imageNode.width = '450';
                imageNode.src = '${imagePath}';
                document.getElementById('images-container').insertBefore(imageNode, document.getElementById('images-container').firstChild);
            }
        }
    });
}