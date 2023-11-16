import { useState } from "react";
import { isEmpty, verifyHyperlinks } from "../../utils";
import QuestionInput from "./question-input";
import axios from 'axios'

export default function AskQuestion(props) {
  const { viewHome } = props;
  
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");

  const [tags, setTags] = useState("");
  const [tagsError, setTagsError] = useState("");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const addQuestion = async () => {
    let error = false;
    setTitleError("");
    setTextError("");
    setTagsError("");
    setUsernameError("");


    if (isEmpty(title)) {
      setTitleError("Title is empty");
      error = true;
    } else if (title.length > 100) {
      setTitleError("Title is too long");
      error = true;
    }

    if (isEmpty(text)) {
      setTextError("Text is empty");
      error = true;
    }

    if (!verifyHyperlinks(text)) {
      setTextError("Hyperlink error");
      error = true;
    }

    if (isEmpty(tags)) {
      setTagsError("Tags are empty");
      error = true;
    }
    const tagsArr = tags.split(/[ ,]+/).map((t) => t.toLowerCase());

    if (tagsArr.length > 5) {
      setTagsError("Too many tags");
      error = true;
    } else if (tagsArr.length === 1 && isEmpty(tagsArr[0])) {
      setTagsError("Tags are empty");
      error = true;
    }

    const seen = new Set()
    for (const tag of tagsArr) {
      if (tag.length > 10) {
        setTagsError("Tag is too long");
        error = true;
      }

      if (seen.has(tag)) {
        setTagsError(`Duplicate tag "${tag}"`);
        error = true;
      }

      seen.add(tag)
    }

    if (isEmpty(username)) {
      setUsernameError("Username is empty");
      error = true;
    }

    if (error) {
      return;
    }


    const body = {
      title,
      text,
      tags: tagsArr,
      asked_by: username
    }
    const url = `http://localhost:8000/questions/create`;

    await axios.post(url, body)
      .then(res => viewHome())
      .catch(err => console.log(err));
  }

  return (
    <div className="questionForm">
      <QuestionInput
        title="Question Title*"
        inputId="questionTitle"
        desc="Limit title to 100 characters or less"
        errorText={titleError}
        inputText={title}
        setInputText={setTitle}
      />
      <QuestionInput
        title="Question Text*"
        inputId="questionText"
        desc="Add details"
        errorText={textError}
        inputText={text}
        setInputText={setText}
        textarea={true}
      />
      <QuestionInput
        title="Tags*"
        inputId="questionTags"
        desc="Add keywords separated by whitespace"
        errorText={tagsError}
        inputText={tags}
        setInputText={setTags}
      />
      <QuestionInput
        title="Username*"
        inputId="questionUsername"
        errorText={usernameError}
        inputText={username}
        setInputText={setUsername}
      />

      <div className="bottom">
        <button id="postQ" onClick={addQuestion}>
          Post Question
        </button>

        <div className="req">
          * indicates mandatory fields
        </div>
      </div>
    </div>
  )
}