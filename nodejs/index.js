import dotenv from "dotenv";
dotenv.config();
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import { body, validationResult } from "express-validator";

//создание сервера
const app = express();
const PORT = process.env.PORT || 5010;

app.use(express.json());

//передача с одного локал хоста на другой
app.use(cors());

//настройка транспортера для отправки электронной почты
const transporter = nodemailer.createTransport({
  host: "smtp.yandex.by",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

function trimReplace(value) {
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }
  return value;
}

// Валидация данных при обработке POST-запроса от клиента
const validateData = [
  body("name")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("Нет ФИО.")
    .isLength({ min: 5, max: 50 })
    .withMessage("ФИО должно быть 5-50 символов."),
  body("phone")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("Нет телефона.")
    .matches(/^\+[0-9]{5,15}$/)
    .withMessage("Не корректный телефон."),
  body("email")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("Нет Email.")
    .isEmail()
    .isLength({ min: 5, max: 100 })
    .withMessage("Не корректный Email"),
  body("message")
    .customSanitizer(trimReplace)
    .notEmpty()
    .withMessage("Нет сообщения.")
    .isLength({ min: 20, max: 400 })
    .withMessage("Сообщение должно быть 20-400 символов."),
];

app.post("/send-email", validateData, async (req, res) => {
  try {
    //проверяем наличие ошибок валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, phone, email, message } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL, //адрес отправителя
      to: process.env.EMAIL, //адрес получателя
      subject: `Заявка от ${name}`,
      html: `<p><strong>Email:</strong> ${email}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Сообщение:</strong> ${message}</p>`,
    });

	 res.send("Сообщение отправлено!")

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

//чтобы работал порт надо установить прослушку
app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Сервер запущен на порту ${PORT}`);
});
