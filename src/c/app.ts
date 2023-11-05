import {
  CityOption,
  CityOptions,
  getCityById,
  searchCities,
} from "../cities/utils";

//#region ComboBoxes

function getElements(num: number | string) {
  const inputElement = <HTMLInputElement>(
    document.getElementById(`city-input-${num}`)!
  );
  const hiddenInput = <HTMLInputElement>document.getElementById(`c${num}`)!;
  const busyBoxDiv = <HTMLDivElement>(
    document.getElementById(`busy-box-${num}`)!
  );
  const busyBox = <HTMLInputElement>document.getElementById(`b${num}`)!;
  const optionsDiv = <HTMLDivElement>(
    document.getElementById(`city-options-${num}`)!
  );
  return {
    inputElement,
    hiddenInput,
    busyBoxDiv,
    busyBox,
    optionsDiv,
  };
}

function selectCityOption(num: string, cityId: string) {
  const { inputElement, hiddenInput, busyBoxDiv, busyBox, optionsDiv } =
    getElements(num);
  const city = getCityById(cityId);
  if (city) {
    optionsDiv.innerHTML = "";
    hiddenInput.value = cityId;
    inputElement.value = city.city;
    busyBoxDiv.style.opacity = "1";
    busyBox.disabled = false;
  }
}
if (selectCityOption.name !== "selectCityOption") {
  console.log("ERROR");
  selectCityOption("", "");
}

function getCityOptionHTML(num: number, c: CityOption): string {
  return `
    <div class="city-option" id="${num}--${c.link}" onclick="selectCityOption(${num}, '${c.link}')">
      ${c.city}, ${c.country}
    </div>
  `;
}

function initComboBox(num: number) {
  const { inputElement, hiddenInput, busyBoxDiv, busyBox, optionsDiv } =
    getElements(num);
  const renderOptions = (cityOptions: CityOptions) => {
    const optionsHTML = cityOptions
      .map((c) => getCityOptionHTML(num, c))
      .join("\n");
    optionsDiv.innerHTML = `<div class="city-options">${optionsHTML}</div>`;
  };
  inputElement.addEventListener("input", (ev) => {
    const textInput = (ev.target as HTMLInputElement).value;
    if (hiddenInput.value !== "") {
      hiddenInput.value = "";
      busyBoxDiv.style.opacity = "0.25";
      busyBox.disabled = true;
    }
    if (textInput.length >= 2) {
      const inputLowerCase = textInput.toLowerCase();
      const cityOptions = searchCities(inputLowerCase);
      renderOptions(cityOptions);
    } else {
      optionsDiv.innerHTML = "";
    }
  });
}

initComboBox(1);

//#endregion ComboBoxes

//#region AddButton

let curr = 2;
const moreDiv = <HTMLDivElement>document.getElementById("more")!;
const addBtn = <HTMLButtonElement>document.getElementById("add")!;

function renderCitySelect() {
  const div = document.createElement("div");
  div.className = "city-select";
  div.id = `city-select-${curr}`;
  div.innerHTML = `
    <div class="city-search">
      <input
        type="text"
        id="city-input-${curr}"
        autocomplete="off"
        placeholder="Search for a city"
      />
      <div id="city-options-${curr}"></div>
    </div>
    <input type="hidden" name="c${curr}" id="c${curr}" />
    <div id="busy-box-${curr}">
      <label for="b${curr}" class="busy-box">
        <input type="checkbox" id="b${curr}" name="b${curr}" value="1" />
        Busy 9-5
      </label>
    </div>
  `;
  moreDiv.appendChild(div);
  initComboBox(curr);
  curr += 1;
  if (curr === 5) {
    addBtn.style.display = "none";
  }
}

addBtn.addEventListener("click", renderCitySelect);

//#endregion AddButton
