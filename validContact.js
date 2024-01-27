// Валидация формы
var formElement = document.forms.INFO;
formElement.onsubmit = validateInfoForm;

function validateInfoForm() {
  var fioElement = formElement.elements.FIO;
  var telElement = formElement.elements.TEL;

  var fioValue = fioElement.value;
  var telValue = parseInt(telElement.value.trim());

  if (fioValue.length > 20) {
	 alert("Введите, пожалуйста, ФИО не длиннее 20 символов!");
	 fioElement.focus();
	 return false;
  }
  if (isNaN(telValue)) {
	 alert("Введите, пожалуйста, в поле телефона корректный номер!");
	 telElement.focus();
	 return false;
  }

  return true;
}


// Очистка формы после отправки
const form = document.forms.INFO;

form.addEventListener('submit', (e) => {
  // действия с данными
  e.preventDefault();
  e.target.reset(); // очищаем форму
})

