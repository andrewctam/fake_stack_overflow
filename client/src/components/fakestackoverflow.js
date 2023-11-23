import { useState } from 'react';
import React from 'react';
import Home from './home/home';
import ViewQuestion from './questions/view-question';
import AskQuestion from './questions/ask-question';
import AnswerQuestion from './questions/answer-question';
import Tags from './tags';
import Welcome from './welcome';

export default function FakeStackOverflow() {
  const [searchStr, setSearchStr] = useState("");
  const [currentQid, setCurrentQid] = useState("");
  const [page, setPage] = useState("Welcome");
  const [heading, setHeading] = useState(undefined)
  const [incrView, setIncrView] = useState(true);

  const [username, setUsername] = useState("")

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      viewHome("Search Results", e.target.value);
    }
  }

  const login = (username)  => {
    setUsername(username);
    setPage("Home");
  }

  const logout = () => {
    setPage("Welcome");
  }

  const viewHome = (heading = undefined, searchResults = undefined) => {
    setCurrentQid("");
    setPage("Home");
    setHeading(heading);
    setSearchStr(searchResults ?? "");
  }
  const viewTags = () => {
    setCurrentQid("");
    setPage("Tags");
  }
  const viewQuestion = (qid, incrView = true) => {
    setCurrentQid(qid);
    setPage("ViewQuestion")
    setIncrView(incrView)
  }
  const viewAskQuestion = () => {
    setCurrentQid("");
    setPage("AskQuestion");
  }
  const viewAnswerQuestion = (qid) => {
    setCurrentQid(qid);
    setPage("AnswerQuestion");
  }

  if (page === "Welcome") {
    return <Welcome login={login} />
  }

  return (
    <>
      <div id="header" className="header">
        <h1 id="fakeStackOverflow" onClick={() => viewHome()}>Fake Stack Overflow</h1>

        <input id="search" className="search" type="text" placeholder="Search . . ." onKeyDown={handleSearch} />

        {username?.length > 0 && (
          <div className='accountBar'>
            <button onClick={logout}> Logout </button>
          </div> 
        )}
      </div>



      <div className="main">
        <div className="menu">
          <div id="queLink" onClick={() => viewHome()} className={`menuItem ${page === "Home" ? "curMenuItem" : ""}`}> Questions </div>
          <div id="tagLink" onClick={viewTags} className={`menuItem ${page === "Tags" ? "curMenuItem" : ""}`}> Tags </div>
        </div>

        {page === "Home" &&
          <Home
            heading={heading}
            searchStr={searchStr}
            viewAskQuestion={viewAskQuestion}
            viewQuestion={viewQuestion}
            backToWelcome={() => {setPage("Welcome")}}
            loggedIn={username.length > 0}
          />
        }
        {page === "ViewQuestion" &&
          <ViewQuestion
            viewAnswerQuestion={viewAnswerQuestion}
            viewAskQuestion={viewAskQuestion}
            qid={currentQid}
            incrView={incrView}
          />
        }
        {page === "AskQuestion" &&
          <AskQuestion
            viewHome={viewHome}
          />
        }
        {page === "AnswerQuestion" &&
          <AnswerQuestion
            qid={currentQid}
            viewQuestion={viewQuestion}
          />
        }
        {page === "Tags" &&
          <Tags
            viewHome={viewHome}
            viewAskQuestion={viewAskQuestion}
          />
        }
      </div>
    </>
  );
}
