// Imports
import { tiposBagagem, tiposAssento } from './options.js';

//global variables
let cotacaoIdaIndex = 2;
let cotacaoVoltaIndex = 2;

// Function to format input value.
export function formatValue(value) {
  let formattedValue = parseFloat(value.replace(/\D/g, '')) / 100;
  formattedValue = formattedValue.toFixed(2).replace('.', ',');
  return 'R$ ' + formattedValue.replace(/(\d)(?=(\d{3})+,)/g, '$1.');
}

// Function created to add a listener to format input value after the DOM has been initialized.
export function ticketInputListeners(cotacoes) {
  const cotacoesArray = Array.from(cotacoes);

  cotacoesArray.forEach(cotacao => {
    const currencyInput = cotacao.querySelector('.currency_input');
    if (currencyInput) {
      currencyInput.addEventListener('input', function (e) {
        let inputVal = e.target.value;
        if (inputVal) {
          const formattedValue = formatValue(inputVal);
          e.target.value = formattedValue;
        }
      });
    }
  });
}

// Function to add listeners to tab_id input fields
export function tabIdListeners(cotacoes) {
  const cotacoesArray = Array.from(cotacoes);

  cotacoesArray.forEach(cotacao => {
    const tabIDInput = cotacao.querySelector('.tab_id');
    if (tabIDInput) {
      tabIDInput.addEventListener('change', function () {
        const loaderElement = cotacao.querySelector('#my-loader');
        const ldld = new ldloader({ root: loaderElement });
        const screenshotImage = cotacao.querySelector('.cotacao_form_item_screenshot_image');
        const tabID = this;

        let screenshotContainer = cotacao.querySelector(".cotacao_form_item_screenshot");
        let cutButton = cotacao.querySelector("#button-cut");

        ldld.on();

        tabID.style.display = 'none';
        screenshotImage.style.display = 'none';
        screenshotImage.src = '';
        cutButton.style.display = 'none';
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
              screenshotImage.style.display = 'flex';
              cutButton.style.display = 'flex';
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
    }
  });
}

export function cutAndConfirmButtonListeners(cotacoes) {
  const cotacoesArray = Array.from(cotacoes);
  cotacoesArray.forEach(cotacao => {
    const cutButton = cotacao.querySelector("#button-cut");
    const confirmButton = cotacao.querySelector("#button-confirm");
    const tabID = cotacao.querySelector('.tab_id');

    let cropper;
    
    cutButton.addEventListener('click', function () {
      const screenshotContainer = cotacao.querySelector(".cotacao_form_item_screenshot");
      const screenshotImage = screenshotContainer.querySelector('img');

      tabID.style.display = 'none';

      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(screenshotImage, {
        aspectRatio: 16 / 9,
        crop: function (event) {
          console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
        }
      });

      cutButton.style.display = 'none';
      confirmButton.style.display = 'block';
    });

    confirmButton.addEventListener('click', function () {
      if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas();
        const croppedImage = new Image();
        croppedImage.src = croppedCanvas.toDataURL();
        const screenshotContainer = cotacao.querySelector(".cotacao_form_item_screenshot");
        const screenshotImage = screenshotContainer.querySelector('img');

        screenshotContainer.removeChild(screenshotImage);
        screenshotContainer.insertBefore(croppedImage, screenshotContainer.firstChild);

        cropper.destroy();
        cropper = null;

        tabID.style.display = 'flex';
        confirmButton.style.display = 'none';
        cutButton.style.display = 'block';
      } else {
        console.error('cropper is not initialized');
      }
    });
  });
}

// Function to add new listeners.
export function addListeners(cotacoes) {
  ticketInputListeners(cotacoes);
  tabIdListeners(cotacoes);
  cutAndConfirmButtonListeners(cotacoes);
}

// Function to format texts.
function formatText(text) {
  if (text) {
    return text.replace(/_/g, ' ');
  }
  return;
}

// Function to create form item.
function createCotacaoFormItem(imgSrc, spanText, selectOptions = [], inputPlaceholder = "", type,) {
  const div = document.createElement("div");
  div.classList.add(`cotacao_form_item`);

  const imgDiv = document.createElement("div");
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "teste";
  imgDiv.appendChild(img);
  imgDiv.classList.add(`cotacao_form_item_img`);
  div.appendChild(imgDiv);

  const span = document.createElement("span");
  span.textContent = spanText;
  span.classList.add(`cotacao_${type}_id`);
  imgDiv.appendChild(span);

  // Creating div cotacao_${type}_form_item_options for select or input.
  const divOptions = document.createElement("div");
  divOptions.classList.add(`cotacao_form_item_options`);

  if (selectOptions.length > 0) {
    const select = document.createElement("select");

    if (spanText === "Quantidade de bagagens") {
      select.name = "bagagem";
      select.id = "bagagem";
    } else {
      select.name = "assento";
      select.id = "assento";
    }

    selectOptions.forEach(option => {
      const optionItem = document.createElement("option");
      optionItem.value = option;
      optionItem.textContent = option;
      select.appendChild(optionItem);
    });

    divOptions.appendChild(select);
  }

  if (inputPlaceholder !== "") {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "currency_input";
    input.classList.add("currency_input");
    input.placeholder = inputPlaceholder;
    divOptions.appendChild(input);
  }

  // Adding divOptions to div CotacaoFormItem.
  div.appendChild(divOptions);

  return div;
}

// Function to create a line/divider.
function createLine() {
  const line = document.createElement("div");
  line.classList.add("line");
  return line;
}

// Function to create div cotacaoImg
function createCotacaoImg(imgSrc, type, spanText) {
  const div = document.createElement("div");
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "teste";
  div.appendChild(img);

  const span = document.createElement("span");
  span.textContent = spanText;
  span.classList.add(`cotacao_${type}_id`);
  div.appendChild(span);

  div.classList.add(`cotacao_img`);

  return div;
}

// Function to create CotacaoFormItemScreenshot
function createCotacaoFormItemScreenshot(imageSrc) {
  const cotacaoFormItemScreenshot = document.createElement("div");
  cotacaoFormItemScreenshot.classList.add("cotacao_form_item_screenshot");

  const screenshotImage = document.createElement("img");
  screenshotImage.classList.add('cotacao_form_item_screenshot_image');
  screenshotImage.src = imageSrc;

  cotacaoFormItemScreenshot.appendChild(screenshotImage);

  const input = document.createElement("input");
  input.type = "text";
  input.name = "tab_id";
  input.classList.add("tab_id");
  input.placeholder = 'Página ID';
  cotacaoFormItemScreenshot.appendChild(input);

  const loader = document.createElement('div');
  const classesToAdd = ['text-danger', 'ldld', 'bare'];
  classesToAdd.forEach(className => loader.classList.add(className));
  loader.id = 'my-loader';
  cotacaoFormItemScreenshot.appendChild(loader);

  const cut = document.createElement("div");
  cut.classList.add("cut");

  const buttonCut = document.createElement("button");
  buttonCut.id = "button-cut";
  buttonCut.innerText = "Recortar";
  buttonCut.style.display = "none";

  cut.appendChild(buttonCut);

  const confirmCutButton = document.createElement("button");
  confirmCutButton.id = "button-confirm";
  confirmCutButton.innerText = "Confirmar recorte";
  confirmCutButton.style.display = 'none';

  cut.appendChild(confirmCutButton);

  cotacaoFormItemScreenshot.appendChild(cut);

  return cotacaoFormItemScreenshot;
}

// Function to create new "cotacao".
export function createNewCotacaoContainer(type) {
  const cotacaoIndex = type === "ida" ? cotacaoIdaIndex : cotacaoVoltaIndex;
  const cotacoesContainer = document.querySelector(`.cotacoes_${type}`);

  const newCotacao = document.createElement("div");
  newCotacao.classList.add(`cotacao_${type}`);
  newCotacao.id = `cotacao_${type}_${cotacaoIndex}`;

  // Creation of div cotacao_img
  let newCotacaoImg = null;
  if (type === "ida") {
    newCotacaoImg = createCotacaoImg("/assets/header_flight.jpg", type, `Cotação ${type} ${cotacaoIndex}`);
  } else {
    newCotacaoImg = createCotacaoImg("/assets/header_flight_back.jpg", type, `Cotação ${type} ${cotacaoIndex}`);
  }

  newCotacao.appendChild(newCotacaoImg);

  // Add line/divider
  newCotacao.appendChild(createLine());

  // Creating div cotacao_form
  const newCotacaoForm = document.createElement("div");
  newCotacaoForm.classList.add(`cotacao_form`);
  newCotacao.appendChild(newCotacaoForm);

  // Creating an array foreach cotacao_form_item
  const formItems = [
    { imgSrc: "/assets/flight_luggage.jpg", label: "Quantidade de bagagens", options: ["Sem bagagem", "1 mala de 23", "2 malas de 23", "3 malas de 23", "1 mala de 32", "2 malas de 32", "3 malas de 32"], },
    { imgSrc: "/assets/flight_seat.jpg", label: "Tipo de assento", options: ["Econômica", "Econômica premium", "Executiva", "Primeira classe"], },
    { imgSrc: "/assets/flight_price.jpg", label: "Valor do bilhete", inputPlaceholder: "R$" }
  ];

  formItems.forEach((item) => {
    const newItem = createCotacaoFormItem(item.imgSrc, item.label, item.options, item.inputPlaceholder, type,);
    newCotacaoForm.appendChild(newItem);
    newCotacaoForm.appendChild(createLine());
  });

  cotacoesContainer.appendChild(newCotacao);

  const cotacaoFormItemScreenshot = createCotacaoFormItemScreenshot('/assets/flight_page.png');

  newCotacao.appendChild(cotacaoFormItemScreenshot); // Append screenshot section to main div

  // If exists more than one "cotacao", is created an arrow icon before the new "cotacao".
  if (cotacaoIndex > 1) {
    const arrowContainer = document.createElement("div");
    arrowContainer.classList.add("arrow");

    const arrowDown = document.createElement("span");
    arrowDown.classList.add("material-icons");
    arrowDown.textContent = "arrow_downward";

    arrowContainer.appendChild(arrowDown);

    cotacoesContainer.insertBefore(arrowContainer, newCotacao);
  }

  const buttonContainer = document.querySelector(`.cotacoes_${type} .button_add_cotacao`);
  cotacoesContainer.appendChild(buttonContainer);

  type === "ida" ? cotacaoIdaIndex++ : cotacaoVoltaIndex++;

  ticketInputListeners([newCotacao]);

  return newCotacao;
}

// Function to get combinations of cotacoes ida and cotacoes volta
function getCombinations(cotacoes) {
  const combinations = [];
  cotacoes.ida.forEach(cotacaoIda => {
    cotacoes.volta.forEach(cotacaoVolta => {
      combinations.push([cotacaoIda, cotacaoVolta]);
    });
  });

  return combinations;
}

// Function to create cotacoes tables
function renderCotacaoTable(doc, cotacao, verticalPosition, marginX, columnWidth, screenshotImageHeight, pageWidth, pageHeight, footerHeight, headerHeight, logo, logoWidth, logoHeight) {
  const tableID = [[formatText(cotacao.id)]];
  const columns = ["Quantidade de bagagens", "Tipo de assento", "Valor do bilhete"];
  const bagagemValue = tiposBagagem.find(item => item.key === cotacao.bagagem)?.value || cotacao.bagagem;
  const assentoValue = tiposAssento.find(item => item.key === cotacao.assento)?.value || cotacao.assento;
  const valor = cotacao.valor ? `${cotacao.valor}` : 'R$ 0,00';

  const rows = [
    [bagagemValue, assentoValue, valor],
    [{ content: '', colSpan: 3, styles: { minCellHeight: screenshotImageHeight } }]
  ];

  doc.autoTable({
    head: tableID,
    startY: verticalPosition,
    styles: {
      fillColor: [133, 133, 133],
      textColor: [255, 255, 255],
      halign: 'center',
      fontSize: 12,
    },
    margin: { left: marginX, right: marginX }
  });

  verticalPosition = doc.lastAutoTable.finalY;

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: verticalPosition,
    styles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: 'center',
      cellWidth: columnWidth,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { left: marginX, right: marginX },
    didDrawCell: function (data) {
      if (data.row.index === 1 && data.column.index === 0) {
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        const imageWidth = cellWidth;
        const imageHeight = screenshotImageHeight;
        const xOffset = data.cell.x + (cellWidth - imageWidth) / 2;
        const yOffset = data.cell.y + (cellHeight - imageHeight) / 2;
        doc.addImage(cotacao.img, 'PNG', xOffset, yOffset, imageWidth, imageHeight);
      }
    }
  });

  verticalPosition = doc.lastAutoTable.finalY + 5;

  // Veryfing if we need to create another page and insert footer img or just insert the footer img
  if (verticalPosition > pageHeight - footerHeight) {
    doc.addPage(); // Add a new page if there isn't enough space on the current page
    doc.setFillColor(242, 242, 242);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    verticalPosition = headerHeight + 5; // Reset vertical position on the new page
    doc.addImage(logo, 'PNG', logoWidth, logoHeight, 20, 20); // Footer
  } else {
    doc.addImage(logo, 'PNG', logoWidth, logoHeight, 20, 20); // Footer
  }

  return verticalPosition;
}

// Function to create PDFs
export function createPDF(cotacoes) {
  const doc = new window.jspdf.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const midPage = pageWidth / 2;
  const logoWithLetters = '/assets/logo-Skyler-preto.png';
  const logo = '/assets/skyler.png';
  const logoHeight = pageHeight - 25;
  const logoWidth = 5;
  const logoWithLettersSize = 70;
  const imageX = midPage - (logoWithLettersSize / 2);
  const marginX = 20;
  const contentWidth = pageWidth - (2.012 * marginX);
  const columnWidth = contentWidth / 3;
  const screenshotImageHeight = 70;
  const headerHeight = 5;
  const footerHeight = 5;

  let date = new Date();
  date = dateFns.format(date, "dd 'de' MMMM 'de' yyyy", { locale: dateFns.locale.ptBR });

  let verticalPosition = headerHeight;
  const hasCombinations = cotacoes.volta.length >= 1;
  const combinations = hasCombinations ? getCombinations(cotacoes) : [];

  // Document settings
  doc.setFillColor(242, 242, 242);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFont('Helvetica', 'normal');

  // Header
  doc.addImage(logoWithLetters, 'PNG', imageX, verticalPosition, logoWithLettersSize, 30);
  verticalPosition = 40;
  doc.setFontSize(12);
  doc.text(`${date}`, 170, verticalPosition, null, null, 'center');

  verticalPosition += 20;

  if (hasCombinations) {
    combinations.forEach((combination, index) => {
      if (verticalPosition + doc.lastAutoTable.finalY + screenshotImageHeight > pageHeight - footerHeight) {
        doc.addPage(); // Add a new page if there isn't enough space on the current page
        doc.setFillColor(242, 242, 242);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        verticalPosition = headerHeight + 5; // Reset vertical position on the new page
        doc.addImage(logo, 'PNG', logoWidth, logoHeight, 20, 20); // Footer
      }

      doc.text(`OPÇÃO ${index + 1}`, midPage, verticalPosition, null, null, 'center');
      verticalPosition += 5;

      combination.forEach(cotacao => {
        verticalPosition = renderCotacaoTable(doc, cotacao, verticalPosition, marginX, columnWidth, screenshotImageHeight, pageWidth, pageHeight, footerHeight, headerHeight, logo, logoWidth, logoHeight);
      });
    });
  } else {
    doc.text(`IDA`, midPage, verticalPosition, null, null, 'center');
    verticalPosition += 5;

    cotacoes.ida.forEach(cotacao => {
      if (verticalPosition + doc.lastAutoTable.finalY > pageHeight - footerHeight) {
        doc.addPage(); // Add a new page if there isn't enough space on the current page
        doc.setFillColor(242, 242, 242);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        verticalPosition = headerHeight + 5; // Reset vertical position on the new page
        verticalPosition = renderCotacaoTable(doc, cotacao, verticalPosition, marginX, columnWidth, screenshotImageHeight, pageWidth, pageHeight, footerHeight, headerHeight, logo, logoWidth, logoHeight);
        doc.addImage(logo, 'PNG', logoWidth, logoHeight, 20, 20); // Footer
      } else {
        verticalPosition = renderCotacaoTable(doc, cotacao, verticalPosition, marginX, columnWidth, screenshotImageHeight, pageWidth, pageHeight, footerHeight, headerHeight, logo, logoWidth, logoHeight);
      }
    });
  }

  if (doc.lastAutoTable.finalY + 50 > pageHeight - footerHeight) {
    verticalPosition = headerHeight + 5;
    doc.addPage(); // Add a new page if there isn't enough space on the current page
    doc.setFillColor(242, 242, 242);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    // Footer
    doc.setFontSize(10);
    doc.text('Os termos de uso podem ser consultados em: ', midPage, pageHeight - 50, { align: 'center' });
    doc.setFont('Helvetica', 'bold');
    doc.textWithLink('https://voeskyler.com/files/termos-de-uso.pdf', midPage, pageHeight - 45, { url: 'https://voeskyler.com/files/termos-de-uso.pdf', align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.text('Valores e disponibilidade sujeitos à alteração sem aviso prévio, de acordo com a companhia aérea.', midPage, pageHeight - 40, { align: 'center' });
    doc.addImage(logo, 'PNG', logoWidth, logoHeight, 20, 20);
  } else {
    // Footer
    doc.setFontSize(10);
    doc.text('Os termos de uso podem ser consultados em: ', midPage, pageHeight - 50, { align: 'center' });
    doc.setFont('Helvetica', 'bold');
    doc.textWithLink('https://voeskyler.com/files/termos-de-uso.pdf', midPage, pageHeight - 45, { url: 'https://voeskyler.com/files/termos-de-uso.pdf', align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.text('Valores e disponibilidade sujeitos à alteração sem aviso prévio, de acordo com a companhia aérea.', midPage, pageHeight - 40, { align: 'center' });
    doc.addImage(logo, 'PNG', logoWidth, logoHeight, 20, 20);
  }
  // Saving doc
  doc.save('bilhete.pdf');
}

// Function to get screenshot from active/non-active tabs
export function createNewTabAndCapture(url, callback) {
  chrome.windows.create({ url: url, type: 'popup', focused: false }, (newWindow) => {
    setTimeout(() => {
      chrome.tabs.captureVisibleTab(newWindow.id, { format: 'png' }, (screenshotDataUrl) => {
          chrome.windows.remove(newWindow.id, () => {
            callback(screenshotDataUrl);
          });
      });
    }, 5000);
  });
}
