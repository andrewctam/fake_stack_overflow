import { useState } from "react"
import { config, isEmpty, verifyHyperlinks } from "../../utils"
import QuestionInput from "./question-input"
import axios from 'axios'

export default function AnswerQuestion(props) {
  const { qid, viewQuestion } = props;

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [error, setError] = useState("");

  const ansQuestion = async () => {
    let error = false;
    setTextError("");


    if (isEmpty(text)) {
      setTextError("Text is empty");
      error = true;
    }
    if (!verifyHyperlinks(text)) {
      setTextError("Hyperlink error");
      error = true;
    }


    if (error) {
      return;
    }

    const body = {
      qid,
      text
    }

    const url = `http://localhost:8000/answers/create`
    await axios.post(url, body, config)
      .then(res => viewQuestion(qid, false))
      .catch(err => {
        setError(err?.response?.data)
        console.log(err)
      });
  }

  return (
    <div className="questionForm">
      <QuestionInput
        title="Answer Text*"
        inputId="answerText"
        errorText={textError}
        inputText={text}
        setInputText={setText}
        textarea={true}
      />

      <div className="bottom">
        <button id="postAns" onClick={ansQuestion}>
          Post Answer
        </button>

        <p className="inputError">{error}</p>

        <div className="req">
          * indicates mandatory fields
        </div>
      </div>
    </div>
  )

}