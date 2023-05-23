const addBtnn = document.querySelector('.add-picture-btn');
const pictureInput = document.querySelector('#picture-input');

addBtnn.addEventListener('click', () => {
  pictureInput.click();
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault();

  var imageFile = document.getElementById('imageInput').files[0];
  var description = document.getElementById('captionInput').value;

  var formData = new FormData();
  formData.append('image', imageFile);
  formData.append('description', description);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadGallery();
      alert('Picture uploaded successfully!');
    } else {
      alert('Upload failed. Please try again.');
    }
  })
  .catch(error => {
    alert('Upload failed. Please try again.');
  });
});

function loadGallery() {
  const collection = db.collection('gallery');

  collection
    .find()
    .toArray()
    .then((data) => {
      var imageContainer = document.getElementById('imageContainer');
      imageContainer.innerHTML = '';

      data.forEach((item) => {
        var imageDiv = document.createElement('div');
        imageDiv.classList.add('image-item');

        var image = document.createElement('img');
        image.src = item.imageUrl;
        imageDiv.appendChild(image);

        var description = document.createElement('p');
        description.textContent = item.description;
        imageDiv.appendChild(description);

        imageContainer.appendChild(imageDiv);
      });
    })
    .catch((error) => {
      console.error('Error loading gallery:', error);
    });
}

loadGallery();
