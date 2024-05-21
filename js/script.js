import { createNewCotacaoContainer, createPDF, addCurrencyInputListeners} from './helpers.js';

document.addEventListener("DOMContentLoaded", function() {
  // const cutButton = document.getElementById("button-cut");
  // const confirmButton = document.getElementById("button-confirm");
  const pdfGeneration = document.getElementById("pdf_generation");
  const screenshotContainer = document.querySelector(".container");
  const currencyInputs = document.querySelectorAll('.currency_input');
  const cotacoesContainer = document.getElementById("cotacoes");
  const idaRadio = document.getElementById("ida");
  const idaVoltaRadio = document.getElementById("ida_volta");
  const addCotacaoIdaButton = document.querySelector(".cotacoes_ida .button_add_cotacao");
  const addCotacaoVoltaButton = document.querySelector(".cotacoes_volta .button_add_cotacao");

  let default_arrow = document.querySelector(".arrow");
  let cropper;
  let idaCotacoes = [];
  let voltaCotacoes = [];

  // let idaCotacoes = Array.from(document.querySelectorAll('.cotacoes_ida .cotacao_ida .currency_input'));
  // let voltaCotacoes = Array.from(document.querySelectorAll('.cotacoes_volta .cotacao_volta .currency_input'));

  idaRadio.addEventListener("change", function() {
    const cotacoesIdaContainer = document.querySelector(".cotacoes_ida");
    const cotacoesVoltaContainer = document.querySelector(".cotacoes_volta");
  
    if (idaRadio.checked) {
      cotacoesIdaContainer.style.display = "block";
      cotacoesVoltaContainer.style.display = "none";
      default_arrow.style.display = "none";
      idaCotacoes = Array.from(document.querySelectorAll('.cotacoes_ida .cotacao_ida'));
      addCurrencyInputListeners(idaCotacoes);
    }
  });
  
  idaVoltaRadio.addEventListener("change", function() {
    const cotacoesIdaContainer = document.querySelector(".cotacoes_ida");
    const cotacoesVoltaContainer = document.querySelector(".cotacoes_volta");
  
    if (idaVoltaRadio.checked) {
      cotacoesIdaContainer.style.display = "block";
      cotacoesVoltaContainer.style.display = "block";
      default_arrow.style.display = "flex";
      idaCotacoes = Array.from(document.querySelectorAll('.cotacoes_ida .cotacao_ida'));
      voltaCotacoes = Array.from(document.querySelectorAll('.cotacoes_volta .cotacao_volta'));
      addCurrencyInputListeners([...idaCotacoes, ...voltaCotacoes]);
    }
  });  

  addCotacaoIdaButton.addEventListener("click", function() {
    const newCotacao = createNewCotacaoContainer("ida");
    idaCotacoes.push(newCotacao);
  });

  addCotacaoVoltaButton.addEventListener("click", function() {
    const newCotacao = createNewCotacaoContainer("volta");
    voltaCotacoes.push(newCotacao);
  });

  // chrome.tabs.captureVisibleTab(function(screenshotDataUrl) {
  //   const screenshotImage = new Image();
  //   screenshotImage.src = screenshotDataUrl;
  //   screenshotContainer.appendChild(screenshotImage);
  // });

  // cutButton.addEventListener('click', function() {
  //   cropper = new Cropper(screenshotContainer.querySelector('img'), {
  //     aspectRatio: 16 / 9, 
  //     crop: function(event) {
  //       console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
  //     }
  //   });

  //   cutButton.style.display = 'none';
  //   confirmButton.style.display = 'block';
  // });

  // confirmButton.addEventListener('click', function() {
  //   if (cropper) {
  //     const croppedCanvas = cropper.getCroppedCanvas();
  //     const croppedImage = new Image();
  //     croppedImage.src = croppedCanvas.toDataURL();
  //     screenshotContainer.innerHTML = '';
  //     screenshotContainer.appendChild(croppedImage);

  //     cropper.destroy();
  //     cropper = null;

  //     confirmButton.style.display = 'none';
  //     cutButton.style.display = 'block';
  //   }
  // });

  pdfGeneration.addEventListener('click', function() {
    let cotacoesData = [];
    idaCotacoes.forEach(cotacaoItem => {
      console.log('cotacaoItem', cotacaoItem);
      console.log('Valor:', cotacaoItem.querySelector('.currency_input').value);
      const id = cotacaoItem.id;
      const bagagem = cotacaoItem.querySelector('#bagagem').value;
      const assento = cotacaoItem.querySelector('#assento').value;
      const valor = cotacaoItem.querySelector('.currency_input').value;

      cotacoesData.push({ id, bagagem, assento, valor });
    });
    
    voltaCotacoes.forEach(cotacaoItem => {
      console.log('cotacaoItem', cotacaoItem);
      console.log('Valor:', cotacaoItem.querySelector('.currency_input').value);
      const id = cotacaoItem.id;
      const bagagem = cotacaoItem.querySelector('#bagagem').value;
      const assento = cotacaoItem.querySelector('#assento').value;
      const valor = cotacaoItem.querySelector('.currency_input').value;

      cotacoesData.push({ id, bagagem, assento, valor });
    });

    console.log('cotacoes data', cotacoesData);
    // console.log(currencyValues);
    // const screenshotImageUrl = screenshotContainer.querySelector('img').src;
    
    createPDF(cotacoesData, null);
  });
});
