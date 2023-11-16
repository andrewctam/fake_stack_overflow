import { useState, useEffect } from "react";
import { formatAskDate, formatText, s } from "../../utils";
import axios from "axios";

export default function ViewQuestion(props) {
  const { qid, incrView = true, viewAskQuestion, viewAnswerQuestion } = props;
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    const getQuestion = async () => {
      const url = `http://localhost:8000/questions/q/${qid}/${incrView ? "true" : "false"}`
      await axios.get(url)
        .then((res) => setQuestion(res.data))
        .catch((err) => console.log(err));
    }

    getQuestion();
  }, [incrView, qid])

  if (!question) return;
  
  const answers = question.answers.sort((a, b) => a.ansDate < b.ansDate ? 1 : -1)
  return (
    <div>
      <div className="questionTop">
        <div className="questionTopRow">
          <div>{question.answers.length} answer{s(question.answers.length)}</div>
          <h2>{question.title}</h2>

          <button id="askQ" onClick={viewAskQuestion}> Ask Question </button>
        </div>
        <div className="questionTopRow">
          <div>{question.views} view{s(question.views)}</div>
          <p>{formatText(question.text)}</p>

          <div className="askedBy">
            <span className="name">{question.asked_by}</span> asked {formatAskDate(new Date(question.ask_date_time))}
          </div>
        </div>
      </div>

      <div className="answersList">
        {answers.map(a =>
          <div className="answer" key={"ANSWER" + a._id}>
            <div className="answerText">
              {formatText(a.text)}
            </div>
            <div className="ansBy">
              <span className="name">{a.ans_by}</span> answered {formatAskDate(new Date(a.ans_date_time))}
            </div>

          </div>
        )}
      </div>

      <button id="ansQ" onClick={() => viewAnswerQuestion(qid)}> Answer Question </button>
    </div>
  )
}