import { useState } from "react"
import { config, isEmpty, verifyHyperlinks } from "../../utils"
import QuestionInput from "./question-input"
import axios from 'axios'

export default function AnswerQuestion(props) {
  const { qid, viewQuestion } = props;

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");


  const ansQuestion = async () => {
    let error = false;
    setTextError("");
    setUsernameError("");

    if (isEmpty(text)) {
      setTextError("Answer is empty");
      error = true;
    }
    if (!verifyHyperlinks(text)) {
      setTextError("Hyperlink error");
      error = true;
    }
    if (isEmpty(username)) {
      setUsernameError("Username is empty");
      error = true;
    }

    if (error) {
      return;
    }

    const body = {
      qid,
      text,
      ans_by: username
    }

    const url = `http://localhost:8000/answers/create`
    await axios.post(url, body, config)
      .then(res => viewQuestion(qid, false))
      .catch(err => console.log(err));
  }

  return (
    <div className="questionForm">
      <QuestionInput
        title="Username*"
        inputId="answerUsername"
        errorText={usernameError}
        inputText={username}
        setInputText={setUsername}
      />
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

        <div className="req">
          * indicates mandatory fields
        </div>
      </div>
    </div>
  )

}