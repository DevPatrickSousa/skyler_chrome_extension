document.addEventListener("DOMContentLoaded", function() {
  const cutButton = document.getElementById("button-cut");
  const confirmButton = document.getElementById("button-confirm");
  const pdfGeneration = document.getElementById("pdfGeneration");
  const screenshotContainer = document.querySelector(".container");
  const currencyInput = document.getElementById('currencyInput');
  let cropper;

  chrome.tabs.captureVisibleTab(function(screenshotDataUrl) {
    const screenshotImage = new Image();
    screenshotImage.src = screenshotDataUrl;
    screenshotContainer.appendChild(screenshotImage);
  });

  cutButton.addEventListener('click', function() {
    cropper = new Cropper(screenshotContainer.querySelector('img'), {
      aspectRatio: 16 / 9, 
      crop: function(event) {
        console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
      }
    });

    cutButton.style.display = 'none';
    confirmButton.style.display = 'block';
  });

  confirmButton.addEventListener('click', function() {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImage = new Image();
      croppedImage.src = croppedCanvas.toDataURL();
      screenshotContainer.innerHTML = '';
      screenshotContainer.appendChild(croppedImage);

      cropper.destroy();
      cropper = null;

      confirmButton.style.display = 'none';
      cutButton.style.display = 'block';
    }
  });

  pdfGeneration.addEventListener('click', function() {
    const currencyValue = currencyInput.value;
    const doc = new window.jspdf.jsPDF();
    const midPage = doc.internal.pageSize.getWidth() / 2;

    doc.setFillColor(188, 188, 188);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    const screenshotImage = new Image();
    screenshotImage.src = screenshotContainer.querySelector('img').src;
    doc.addImage(screenshotImage, 'PNG', 5, 5, 200, 100);
    
    doc.text(`Valor do bilhete: ${currencyValue}`, midPage, 120, null, null, 'center');
  
    doc.save('bilhete.pdf');
  });

  function formatCurrency(value) {
    let formattedValue = parseFloat(value.replace(/\D/g, '')) / 100;
    formattedValue = formattedValue.toFixed(2).replace('.', ',');
    return 'R$ ' + formattedValue.replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }

  currencyInput.addEventListener('input', function(event) {
      let inputVal = event.target.value;

      if (!inputVal) {
          event.target.value = 'R$ 0,00';
      } else {
          event.target.value = formatCurrency(inputVal);
      }
  });

  currencyInput.addEventListener('blur', function(event) {
      let inputVal = event.target.value;

      if (!inputVal) {
          event.target.value = 'R$ 0,00';
      } else {
          event.target.value = formatCurrency(inputVal);
      }
  });
});
