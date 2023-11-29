import { useState } from 'react';
import React from 'react';
import Home from './home/home';
import ViewQuestion from './questions/view-question';
import AskQuestion from './questions/ask-question';
import AnswerQuestion from './questions/answer-question';
import Tags from './tags';
import Welcome from './welcome';
import Profile from './profile/profile';
import axios from 'axios';
import { config } from '../utils';

export default function FakeStackOverflow() {
  const [searchStr, setSearchStr] = useState("");
  const [currentQid, setCurrentQid] = useState("");
  const [page, setPage] = useState("Welcome");
  const [heading, setHeading] = useState(undefined)
  const [incrView, setIncrView] = useState(true);

  const [uid, setUid] = useState("")
  const [logoutError, setLogoutError] = useState(false);

  const [editingId, setEditingId] = useState(undefined);
  const [userFirst, setUserFirst] = useState(undefined);


  const handleSearch = (e) => {
    if (e.key === "Enter") {
      viewHome("Search Results", e.target.value);
    }
  }

  const login = (uid) => {
    setUid(uid);
    setPage("Home");
  }

  const logout = async () => {
    setLogoutError(false);
    if (uid) {
      const url = `http://localhost:8000/users/logout`
      axios.post(url, {}, config)
      .then((res) => setPage("Welcome"))
      .catch((err) => setLogoutError(true))
    } else {
      setPage("Welcome")
    }
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
  const viewProfile = () => {
    setCurrentQid("");
    setPage("Profile");
  }
  const editQuestion = (qid) => {
    setEditingId(qid);
    setPage("AskQuestion");
  }
  const viewQuestion = (qid, incrView = true) => {
    setCurrentQid(qid);
    setUserFirst(undefined);
    setPage("ViewQuestion")
    setIncrView(incrView)
  }
  const viewQuestionUserFirst = (qid, user, incrView = true) => {
    setCurrentQid(qid);
    setUserFirst(user);
    setPage("ViewQuestion")
    setIncrView(incrView)
  }
  const viewAskQuestion = () => {
    setCurrentQid("");
    setEditingId(undefined);
    setPage("AskQuestion");
  }
  const viewAnswerQuestion = (qid) => {
    setCurrentQid(qid);
    setPage("AnswerQuestion");
  }

  if (page === "Welcome") {
    return <Welcome login={login} />
  }

  const loggedIn = uid.length > 0;
  return (
    <>
      <div id="header" className="header">
        <h1 id="fakeStackOverflow" onClick={() => viewHome()}>Fake Stack Overflow</h1>

        <input id="search" className="search" type="text" placeholder="Search . . ." onKeyDown={handleSearch} />

        <div className='accountBar'>
          <button onClick={logout}>
            {loggedIn ? "Logout" : "Back to Welcome"}
          </button>
          {logoutError && <div className="loginError">Failed to logout</div>}
        </div>
      </div>

      <div className="main">
        <div className="menu">
          <div id="queLink" onClick={() => viewHome()} className={`menuItem ${page === "Home" ? "curMenuItem" : ""}`}> Questions </div>
          <div id="tagLink" onClick={viewTags} className={`menuItem ${page === "Tags" ? "curMenuItem" : ""}`}> Tags </div>

          {loggedIn && (
            <div id="tagLink" onClick={viewProfile} className={`menuItem ${page === "Profile" ? "curMenuItem" : ""}`}> Profile </div>
          )}
        </div>

        {page === "Home" &&
          <Home
            heading={heading}
            searchStr={searchStr}
            viewAskQuestion={viewAskQuestion}
            viewQuestion={viewQuestion}
            backToWelcome={() => { setPage("Welcome") }}
            loggedIn={loggedIn}
          />
        }
        {page === "ViewQuestion" &&
          <ViewQuestion
            viewAnswerQuestion={viewAnswerQuestion}
            viewAskQuestion={viewAskQuestion}
            qid={currentQid}
            incrView={incrView}
            loggedIn={loggedIn}
            userFirst={userFirst}
          />
        }
        {page === "AskQuestion" &&
          <AskQuestion
            editingId={editingId}
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
            loggedIn={loggedIn}
          />
        }

        {page === "Profile" &&
          <Profile
            uid={uid}
            viewQuestion={viewQuestion}
            editQuestion={editQuestion}
            viewQuestionUserFirst={viewQuestionUserFirst}
            viewHome={viewHome}
          />
        }
      </div>
    </>
  );
}
