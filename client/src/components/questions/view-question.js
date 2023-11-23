import { useState, useEffect } from "react";
import { config, formatAskDate, formatText, s } from "../../utils";
import axios from "axios";
import Answer from "./answer";
import CommentList from "../comments/comment-list";

export default function ViewQuestion(props) {
  const { qid, incrView = true, viewAskQuestion, viewAnswerQuestion, loggedIn } = props;
  const [question, setQuestion] = useState(null);

  const [page, setPage] = useState(0);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    const getQuestion = async () => {
      const url = `http://localhost:8000/questions/q/${qid}/${incrView ? "true" : "false"}`
      await axios.get(url, config)
        .then((res) => {
          console.log(res)
          setQuestion(res.data)
        })
        .catch((err) => console.log(err));
    }

    getQuestion();
  }, [incrView, qid])

  const vote = async (num) => {
    const url = `http://localhost:8000/questions/vote`

    const body = {
      qid,
      upvote: num > 0
    }

    await axios.post(url, body, config)
      .then((res) => {
        console.log(res.data)
        const q = {
          ...question,
          votes: parseInt(res.data)
        }

        setQuestion(q)
        setVoteError("")
      })
      .catch((err) => {
        console.log(err)
        setVoteError(err?.response?.data)
      })
  }

  
  if (!question) return;
  
  const answers = question.answers.sort((a, b) => a.ansDate < b.ansDate ? 1 : -1)
  return (
    <div>
      <div className="questionTop">
        <div className="questionTopRow">
          <div>{question.answers.length} answer{s(question.answers.length)}</div>
          <h2>{question.title}</h2>

          {loggedIn && <button id="askQ" onClick={viewAskQuestion}> Ask Question </button>}
          {loggedIn && (<div>
            <button className="voteBtn" onClick={() => { vote(1) }}> Upvote </button>
            <button className="voteBtn" onClick={() => { vote(-1) }}> Downvote </button>
            <div className="inputError">{voteError}</div>
          </div>)}
        </div>
        <div className="questionTopRow">
          <div>{question.views} view{s(question.views)}, {question.votes} vote{s(question.votes)}</div>
          <p>{formatText(question.text)}</p>

          <div className="askedBy">
            <span className="name">{question.asked_by}</span> asked {formatAskDate(new Date(question.ask_date_time))}
          </div>
        </div>
      </div>

      <div className="answersList">
        {answers.slice(page * 5, (page + 1) * 5).map(a =>
          <Answer
            key={"ANSWER" + a._id}
            aid={a._id}
            comments={a.comments}
            text={a.text}
            ans_date_time={a.ans_date_time}
            ans_by={a.ans_by}
            votes={a.votes}
            loggedIn={loggedIn}
          />
        )}
      </div>
      
      {(answers.length > 5) &&
        (<div className="pageBtns">
          <button className="pageBtn"
            disabled={page <= 0}
            onClick={() => { setPage(page - 1) }}>
            Prev</button >
          <button className="pageBtn"
            disabled={page >= Math.ceil(answers.length / 5) - 1}
            onClick={() => { setPage(page + 1) }}>
            Next</button>
        </div>)}

      <CommentList
        comments={question.comments}
        parentType="Question"
        loggedIn={loggedIn}
        id={qid}
      />

      <button id="ansQ" onClick={() => viewAnswerQuestion(qid)}> Answer Question </button>
    </div>
  )
}