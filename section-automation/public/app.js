const sectionSelect = document.getElementById("sectionSelect");
const sectionTrigger = sectionSelect.querySelector(".section-trigger");
const sectionText = document.getElementById("sectionText");
const sectionInput = document.getElementById("section");
const sectionOptions = sectionSelect.querySelectorAll(".section-options button");

sectionTrigger.addEventListener("click", () => {
  sectionSelect.classList.toggle("open");
});

sectionOptions.forEach((option) => {
  option.addEventListener("click", () => {
    sectionText.textContent = option.textContent;
    sectionInput.value = option.dataset.value;

    sectionOptions.forEach((item) => {
      item.classList.remove("selected");
    });

    option.classList.add("selected");

    sectionSelect.classList.remove("open");
  });
});

document.addEventListener("click", (event) => {
  if (!sectionSelect.contains(event.target)) {
    sectionSelect.classList.remove("open");
  }
});