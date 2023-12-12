import { useEffect, useState } from "react";
import { config, isEmpty, verifyHyperlinks } from "../../utils";
import QuestionInput from "./question-input";
import axios from 'axios'

export default function AskQuestion(props) {
  const { viewHome, editingId } = props;

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");

  const [tags, setTags] = useState("");
  const [tagsError, setTagsError] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      const url = `http://localhost:8000/questions/q/${editingId}/false`;
  
      await axios.get(url, config)
        .then((res) => {
          console.log(res)
          setTitle(res.data.title)
          setSummary(res.data.summary)
          setText(res.data.text)
          setTags(res.data.tags.join(" "))
  
        })
        .catch((err) => console.log(err));
    }
    if (editingId) {
      fetchQuestion();
    }
  }, [editingId])

  const deleteQuestion = async () => {
    if (!editingId) return;
    const body = {
      qid: editingId
    }

    const url = `http://localhost:8000/questions/delete`;

    await axios.post(url, body, config)
      .then(res => viewHome())
      .catch(err => {
        console.log(err)
        setError(err?.response?.data ?? "Error communicating with server");
      });
  }
  const addQuestion = async () => {
    const editing = editingId !== undefined;

    let error = false;
    setTitleError("");
    setTextError("");
    setSummaryError("");
    setTagsError("");


    if (isEmpty(title)) {
      setTitleError("Title is empty");
      error = true;
    } else if (title.length > 50) {
      setTitleError("Title is too long");
      error = true;
    }

    if (isEmpty(summary)) {
      setSummaryError("Summary is empty");
      error = true;
    } else if (summary.length > 140) {
      setSummaryError("Summary is too long");
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

    if (error) {
      return;
    }

    const body = {
      qid: editing ? editingId: undefined,
      title,
      text,
      summary,
      tags: tagsArr,
    }
    const url = `http://localhost:8000/questions/${editing ? "edit" : "create"}`;

    await axios.post(url, body, config)
      .then(res => viewHome())
      .catch(err => {
        console.log(err)
        setError(err?.response?.data ?? "Error communicating with server");
      });
  }

  return (
    
    <div className="questionForm">
      <div>
        <h2>{editingId ? "Edit Question" : "Ask Question"}</h2>
      </div>
      <QuestionInput
        title="Question Title*"
        inputId="questionTitle"
        desc="Limit title to 50 characters or less"
        errorText={titleError}
        inputText={title}
        setInputText={setTitle}
      />
      <QuestionInput
        title="Question Summary*"
        inputId="questionTitle"
        desc="Limit summary to 140 characters or less"
        errorText={summaryError}
        inputText={summary}
        setInputText={setSummary}
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
      <div className="bottom">
        <button id="postQ" onClick={addQuestion}>
          {editingId ? "Save Edits" : "Post Question"}
        </button>
        {!!editingId &&
          <button className="delQ" onClick={deleteQuestion}>
            Delete Question
          </button>
        }

        <div className="req">
          * indicates mandatory fields
        </div>
      </div>
      <p className="inputError">{error}</p>
    </div>
  )
}