import { useState, useMemo, useEffect } from "react";
import { config, s } from "../../utils";
import HomeQuestion from "./home-question";
import axios from "axios";

export default function Home(props) {
  const { searchStr, heading, viewQuestion, viewAskQuestion, backToWelcome, loggedIn } = props;

  const [filter, setFilter] = useState("Newest");
  const [questions, setQuestions] = useState([]);

  const [page, setPage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      const url = `http://localhost:8000/questions/all/${searchStr}`;

      await axios.get(url, config)
        .then((res) => {
          console.log(res)
          setQuestions(res.data)
        })
        .catch((err) => {
          console.log(err);
          setError("Error fetching questions. Please try again.")
        });
    }

    fetchQuestions();
  }, [searchStr]);

  useEffect(() => {
    setPage(0);
  }, [filter])


  let noSearchResults = searchStr.length > 0 && questions.length === 0;
  let sortedQuestions = useMemo(() => {
    let sorted = [...questions];

    if (filter === "Active") {
      sorted = sorted.sort((a, b) => {
        if (a.answers.length === 0 && b.answers.length === 0) {
          return a.answers < b.answers ? 1 : -1
        }

        if (a.answers.length === 0) return 1;
        if (b.answers.length === 0) return -1;


        const aRecent = new Date(a.lastAnswerTime);
        const bRecent = new Date(b.lastAnswerTime);

        if (bRecent > aRecent) {
          return 1;
        } else {
          return -1;
        }
      })
    } else {
      if (filter === "Unanswered") {
        sorted = sorted.filter((q) => q.answers.length === 0)
      }

      sorted.sort((a, b) => a.ask_date_time < b.ask_date_time ? 1 : -1)
    }

    return sorted;
  }, [filter, questions]);

  if (error.length > 0) {
    if (searchStr) {
      return <div className='noQs'>No Questions Found</div>
    }
    return <div className="errorScreen">
      <h2>{error}</h2>
      <button onClick={backToWelcome}>Back To Welcome Page</button>
    </div>
  }


  return (
    <div className="questions">
      <div className="questionsTop">
        <div className="questionsInfo">
          <h2>{heading ?? "All Questions"}</h2>

          { loggedIn && <button id="askQ" onClick={viewAskQuestion}> Ask Question </button> }
        </div>
        <div className="questionsInfo">
          <p className="questionCount">{questions.length} question{s(questions.length)}</p>

          <div className="sort">
            <div className={filter === "Newest" ? 'sortSelected' : ''}
              onClick={() => setFilter("Newest")}
              id="newest">Newest</div>

            <div className={filter === "Active" ? 'sortSelected' : ''}
              onClick={() => setFilter("Active")}
              id="active">Active</div>

            <div className={filter === "Unanswered" ? 'sortSelected' : ''}
              onClick={() => setFilter("Unanswered")}
              id="unanswered">Unanswered</div>
          </div>

        </div>
      </div>

      <div id="questionsList" className="questionsList">
        {sortedQuestions.slice(page * 5, (page + 1) * 5).map(q =>
          <HomeQuestion
            key={"QUESTION" + q._id}
            viewQuestion={() => viewQuestion(q._id)}
            q={q}
          />
        )}

        {noSearchResults && <div className='noQs'>No Questions Found</div>}
      </div>

      {questions.length > 5 &&
        (<div className="pageBtns">
          <button className="pageBtn"
            disabled={page <= 0}
            onClick={() => { setPage(page - 1) }}>
            Prev</button >
          <button className="pageBtn"
            disabled={page >= Math.ceil(questions.length / 5) - 1}
            onClick={() => { setPage(page + 1) }}>
            Next</button>
        </div>)}
    </div>
  )

}