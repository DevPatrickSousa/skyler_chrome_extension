// Imports

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
// export function formattedValueListener(value) {
//   value.addEventListener('input', function(e) {
//     let inputVal = e.target.value;
//     e.target.value = inputVal ? formatValue(inputVal) : 'R$ 0,00';
//   });
// }

export function addCurrencyInputListeners(cotacoes) {
  const cotacoesArray = Array.from(cotacoes);

  cotacoesArray.forEach(cotacao => {
    const currencyInput = cotacao.querySelector('.currency_input');
    if (currencyInput) {
      currencyInput.addEventListener('input', function(e) {
        let inputVal = e.target.value;
        if (inputVal) {
          const formattedValue = formatValue(inputVal);
          e.target.value = formattedValue;
        }
      });
    }
  });
}

// Function to create form item.
function createCotacaoFormItem(imgSrc, spanText, selectOptions = [], inputPlaceholder = "", type, ) {
  const div = document.createElement("div");
  div.classList.add(`cotacao_form_item`);

  const imgDiv = document.createElement("div");
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "Imagem";
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
  img.alt = "Imagem";
  div.appendChild(img);

  const span = document.createElement("span");
  span.textContent = spanText;
  span.classList.add(`cotacao_${type}_id`);
  div.appendChild(span);

  div.classList.add(`cotacao_img`);

  return div;
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
  if(type === "ida") {
    newCotacaoImg = createCotacaoImg("/assets/header_flight.jpg", type, `Cotação ${type} ${cotacaoIndex}`);
  }else {
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
    const newItem = createCotacaoFormItem(item.imgSrc, item.label, item.options, item.inputPlaceholder, type,  );
    newCotacaoForm.appendChild(newItem);
    newCotacaoForm.appendChild(createLine());
  });

  cotacoesContainer.appendChild(newCotacao);

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

  addCurrencyInputListeners([newCotacao]);

  return newCotacao;
}

// Function to create PDFs.
export function createPDF(cotacoes, screenshotImageUrl) {
  const doc = new window.jspdf.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const midPage = pageWidth / 2;
  const imageUrl = '/assets/logo-Skyler-branco.png';
  const imageSize = 50;
  const imageX = midPage - (imageSize / 2); // Posição X para centralizar horizontalmente

  let verticalPosition = 50;
  let verticalImagePosition = 5;

  doc.setFillColor(188, 188, 188);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  doc.addImage(imageUrl, 'PNG', imageX, verticalImagePosition, imageSize, imageSize);
  // Ajustar a posição vertical após a imagem
  verticalPosition = verticalImagePosition + 50 + 15;

  // const screenshotImage = new Image();
  // screenshotImage.src = screenshotImageUrl;
  // doc.addImage(screenshotImage, 'PNG', 5, 5, 200, 100);

  cotacoes.forEach((cotacao) => {
    doc.text(`Cotação ID ${cotacao.id}`, midPage, verticalPosition, null, null, 'center');

    verticalPosition += 10;

    doc.text(`Valor do bilhete: ${cotacao.valor}`, midPage, verticalPosition, null, null, 'center');

    verticalPosition += 20;
  })

  doc.save('bilhete.pdf');
}

