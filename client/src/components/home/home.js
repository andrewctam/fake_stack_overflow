import { useState, useEffect } from "react";
import { s } from "../../utils";
import HomeQuestion from "./home-question";
import axios from "axios";

export default function Home(props) {
  const { searchStr, heading, viewQuestion, viewAskQuestion } = props;

  const [filter, setFilter] = useState("Newest");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const url = `http://localhost:8000/questions/all/${searchStr}`;
        
      await axios.get(url)
        .then((res) => {
          console.log(res)
          setQuestions(res.data)
        })
        .catch((err) => console.log(err));
    }

    fetchQuestions();
    
  }, [searchStr]);

  
  let noSearchResults = searchStr.length > 0 && questions.length === 0;
  let sorted = questions;

  if (filter === "Active") {
    sorted = sorted.sort((a, b) => {
      if (a.answersCount === 0 && b.answersCount === 0) {
        return a.answers < b.answers ? 1 : -1
      }

      if (a.answersCount === 0) return 1;
      if (b.answersCount === 0) return -1;


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
      sorted = sorted.filter((q) => q.answersCount === 0)
    }

    sorted.sort((a, b) => a.ask_date_time < b.ask_date_time ? 1 : -1)
  }
  
  return (
    <div className="questions">
      <div className="questionsTop">
        <div className="questionsInfo">
          <h2>{heading ?? "All Questions"}</h2>

          <button id="askQ" onClick={viewAskQuestion}> Ask Question </button>
        </div>
        <div className="questionsInfo">
          <p className="questionCount">{sorted.length} question{s(sorted.length)}</p>

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
        {sorted.map(q =>
          <HomeQuestion
            key={"QUESTION" + q._id}
            viewQuestion={viewQuestion}
            q={q}
          />
        )}

        {noSearchResults && <div className='noQs'>No Questions Found</div>}
      </div>
    </div>
  )

}