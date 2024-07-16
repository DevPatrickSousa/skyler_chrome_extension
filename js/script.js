import { createNewCotacaoContainer, createPDF, addListeners } from './helpers.js';

document.addEventListener("DOMContentLoaded", function () {
  const cutButtonElements = document.querySelectorAll("#button-cut");
  const confirmButton = document.getElementById("button-confirm");
  const pdfGeneration = document.getElementById("pdf_generation");
  const idaRadio = document.getElementById("ida");
  const idaVoltaRadio = document.getElementById("ida_volta");
  const addCotacaoIdaButton = document.querySelector(".cotacoes_ida .button_add_cotacao");
  const addCotacaoVoltaButton = document.querySelector(".cotacoes_volta .button_add_cotacao");
  const tabIDElements = document.querySelectorAll(".tab_id");
  const confirmationButtonElements = document.querySelectorAll("#button-confirm");

  let default_arrow = document.querySelector(".arrow");
  let pdfButton = document.querySelector(".createPDF");
  let cropper;
  let idaCotacoes = [];
  let voltaCotacoes = [];

  idaRadio.addEventListener("change", function () {
    const cotacoesIdaContainer = document.querySelector(".cotacoes_ida");
    const cotacoesVoltaContainer = document.querySelector(".cotacoes_volta");

    if (idaRadio.checked) {
      cotacoesIdaContainer.style.display = "block";
      cotacoesVoltaContainer.style.display = "none";
      default_arrow.style.display = "none";
      pdfButton.style.display = "flex";
      idaCotacoes = Array.from(document.querySelectorAll('.cotacoes_ida .cotacao_ida'));
      addListeners(idaCotacoes)
    }
  });

  idaVoltaRadio.addEventListener("change", function () {
    const cotacoesIdaContainer = document.querySelector(".cotacoes_ida");
    const cotacoesVoltaContainer = document.querySelector(".cotacoes_volta");

    if (idaVoltaRadio.checked) {
      cotacoesIdaContainer.style.display = "block";
      cotacoesVoltaContainer.style.display = "block";
      default_arrow.style.display = "flex";
      pdfButton.style.display = "flex";
      idaCotacoes = Array.from(document.querySelectorAll('.cotacoes_ida .cotacao_ida'));
      voltaCotacoes = Array.from(document.querySelectorAll('.cotacoes_volta .cotacao_volta'));
      addListeners([...idaCotacoes, ...voltaCotacoes]);
    }
  });

  addCotacaoIdaButton.addEventListener("click", function () {
    const newCotacao = createNewCotacaoContainer("ida");
    idaCotacoes.push(newCotacao);
    addListeners([newCotacao]);
  });

  addCotacaoVoltaButton.addEventListener("click", function () {
    const newCotacao = createNewCotacaoContainer("volta");
    voltaCotacoes.push(newCotacao);
    addListeners([newCotacao]);
  });

  tabIDElements.forEach(tabID => {
    const cotacao = tabID.closest('.cotacao_ida') || tabID.closest('.cotacao_volta'); // Getting the correct cotacao before doing changes
    tabID.addEventListener('change', function () {
      const screenshotImage = cotacao.querySelector('.cotacao_form_item_screenshot_image');
      const screenshotContainer = cotacao.querySelector(".cotacao_form_item_screenshot");
      const cutButton = cotacao.querySelector('#button-cut');
      const ldld = new ldloader({ root: cotacao.querySelector(".my-loader") });

      ldld.on();

      tabID.style.display = 'none';
      confirmButton.style.display = 'none';
      cutButton.style.display = 'none';
      screenshotImage.style.display = 'none';
      screenshotImage.src = '';
      screenshotContainer.style.width = '500px';
      screenshotContainer.style.height = '245px';

      const tabIndex = parseInt(tabID.value);

      if (tabID.value) {
        tabID.style.borderBottom = 'none';
      } else {
        tabID.style.borderBottom = '1px solid white';
      }

      if (!isNaN(tabIndex)) {
        chrome.runtime.sendMessage({ action: 'captureTab', tabIndex: tabIndex }, function (response) {
          if (response.success) {
            ldld.off();
            screenshotContainer.style.width = 'auto';
            screenshotContainer.style.height = 'auto';
            cutButton.style.display = 'flex';
            screenshotImage.style.display = 'flex';
            tabID.style.display = 'flex';
            screenshotImage.src = response.screenshotDataUrl;
          } else {
            alert(response.message || "Erro ao capturar imagem.");
            ldld.off();
          }
        });
      } else {
        alert("Número da página inválido.");
      }
    });
  });

  cutButtonElements.forEach((cutButton) => {
    const cotacao = cutButton.closest('.cotacao_ida') || cutButton.closest('.cotacao_volta'); // Getting the correct cotacao before doing changes
    if (cotacao) {
      cutButton.addEventListener("click", function () {
        const confirmButton = cotacao.querySelector("#button-confirm");
        const screenshotContainer = cotacao.querySelector(".cotacao_form_item_screenshot");

        if (cropper) {
          cropper.destroy();
        }

        cropper = new Cropper(screenshotContainer.querySelector('img'), {
          aspectRatio: 16 / 9,
          crop: function (event) {
            console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
          }
        });

        const confirmationButtonElements = cotacao.querySelectorAll("#button-confirm");
        confirmationButtonElements.forEach((confirmationButton) => {
          confirmationButton.addEventListener("click", function () {
            const confirmButton = cotacao.querySelector("#button-confirm");
            const screenshotContainer = cotacao.querySelector(".cotacao_form_item_screenshot");
            const screenshotImage = screenshotContainer.querySelector('img');

            if (cropper) {
              const croppedCanvas = cropper.getCroppedCanvas();
              const croppedImage = new Image();
              croppedImage.src = croppedCanvas.toDataURL();

              screenshotContainer.removeChild(screenshotImage);
              screenshotContainer.insertBefore(croppedImage, screenshotContainer.firstChild);

              cropper.destroy();
              cropper = null;

              confirmButton.style.display = 'none';
              cutButton.style.display = 'block';
            }
          });
        });
      });
    }
  });

  pdfGeneration.addEventListener('click', function () {
    let cotacoesData = { ida: [], volta: [] };

    idaCotacoes.forEach(cotacaoItem => {
      const id = cotacaoItem.id;
      const bagagem = cotacaoItem.querySelector('#bagagem').value;
      const assento = cotacaoItem.querySelector('#assento').value;
      const valor = cotacaoItem.querySelector('.currency_input').value;
      const img = cotacaoItem.querySelector(".cotacao_form_item_screenshot").querySelector('img').src;

      cotacoesData.ida.push({ id, bagagem, assento, valor, img });
    });

    voltaCotacoes.forEach(cotacaoItem => {
      const id = cotacaoItem.id;
      const bagagem = cotacaoItem.querySelector('#bagagem').value;
      const assento = cotacaoItem.querySelector('#assento').value;
      const valor = cotacaoItem.querySelector('.currency_input').value;
      const img = cotacaoItem.querySelector(".cotacao_form_item_screenshot").querySelector('img').src;

      cotacoesData.volta.push({ id, bagagem, assento, valor, img });
    });

    createPDF(cotacoesData);
  });
});
