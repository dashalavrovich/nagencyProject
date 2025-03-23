// // Валидация формы
// var formElement = document.forms.INFO;
// formElement.onsubmit = validateInfoForm;

// function validateInfoForm() {
//   var fioElement = formElement.elements.FIO;
//   var telElement = formElement.elements.TEL;

//   var fioValue = fioElement.value;
//   var telValue = parseInt(telElement.value.trim());

//   if (fioValue.length > 20) {
// 	 alert("Введите, пожалуйста, ФИО не длиннее 20 символов!");
// 	 fioElement.focus();
// 	 return false;
//   }
//   if (isNaN(telValue)) {
// 	 alert("Введите, пожалуйста, в поле телефона корректный номер!");
// 	 telElement.focus();
// 	 return false;
//   }

//   return true;
// }

// // Очистка формы после отправки
// const form = document.forms.INFO;

// form.addEventListener('submit', (e) => {
//   // действия с данными
//   e.preventDefault();
//   e.target.reset(); // очищаем форму
// })

"use strict";

async function submitForm(event) {
  event.preventDefault();
  const form = event.target;
  const formBtn = document.querySelector(".form_btn");
  const formSendResult = document.querySelector(".form_send-result");
  formSendResult.textContent = "";

  //получение данных из формы
  const formData = new FormData(form);
  const formDataObject = {};

  formData.forEach((value, key) => {
    formDataObject[key] = value.trim().replace(/\s+/g, " ");
  });

  //валидация полей на клиенте
  const validationErrors = validateForm(formDataObject);

  //обновление интерфейса для отображения ошибок
  displayErrors(validationErrors);
  if (validationErrors.length > 0) return;

  //отправка формы на бэк
  sendFormData(form, formBtn, formSendResult, formDataObject);
}

async function sendFormData(form, formBtn, formSendResult, formDataObject) {
  try {
    formBtn.textContent = "Загрузка...";
    formBtn.disabled = true; //кнопка некликабельна

    const response=await fetch("http://localhost:5010/send-email",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(formDataObject)
    });

    if(response.ok){
      formSendResult.textContent="Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.";
      formSendResult.style.color="green";
      formSendResult.style.fontSize="12px";
      formSendResult.style.marginTop="10px";
      form.reset();
    }else if(response.status===422){
      const errors=await response.json()
      console.log(errors);
      throw new Error("Ошибка валидации данных")
    }else{
      throw new Error(response.statusText)
    }

  } catch (error) {
    console.error(error.message);
    formSendResult.textContent = "Письмо не отправлено! Попробуйте позже.";
    formSendResult.style.color = "red";
  } finally {
    formBtn.textContent = "Отправить";
    formBtn.disabled = false; //запрос прошел -> кнопку делаем кликабельной
  }
}

function displayErrors(errors) {
  //скрытие всех ошибок перед отображением новых
  const errorElements = document.querySelectorAll(".form_error");

  errorElements.forEach((errorElement) => {
    errorElement.textContent = "";
  });

  if (errors.length < 1) return;

  //отображение ошибок для соответстующих полей
  errors.forEach((error) => {
    const { field, message } = error;
    const errorElement = document.querySelector(`[data-for="${field}"]`);
    errorElement.textContent = message;
  });
}

function validateForm(formData) {
  const { name, email, phone, message } = formData;

  const phoneRegex = /^\+[0-9]{5,15}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errors = [];

  if (!name) {
    errors.push({ field: "name", message: "Пожалуйста, введите ваше ФИО." });
  } else if (name.length < 5 || name.length > 20) {
    errors.push({
      field: "name",
      message:
        "Пожалуйста, введите корректные данные. Пример: Быков Иван Петрович",
    });
  }

  if (!phone) {
    errors.push({
      field: "phone",
      message: "Пожалуйста, введите номер телефона.",
    });
  } else if (!phoneRegex.test(phone)) {
    errors.push({
      field: "phone",
      message:
        "Пожалуйста, введите корректный номер телефона. Пример: +375257851204",
    });
  }

  if (!email) {
    errors.push({
      field: "email",
      message: "Пожалуйста, введите адрес электронной почты.",
    });
  } else if (
    !emailRegex.test(email) ||
    email.length < 5 ||
    email.length > 100
  ) {
    errors.push({
      field: "email",
      message:
        "Пожалуйста, введите корректный адрес электронной почты. Пример: frontend@gmail.com",
    });
  }

  if (!message) {
    errors.push({
      field: "message",
      message: "Пожалуйста, введите сообщение.",
    });
  } else if (message.length < 20 || message.length > 400) {
    errors.push({
      field: "message",
      message: "В сообщении должно быть мин. 20 и не более 400 символов.",
    });
  }

  return errors;
}
