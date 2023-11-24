import axios from "axios";
import { config, formatText, s } from "../../utils";
import { useState } from "react";

export default function CommentDisplay(props) {
    const { commentId, text, votes, commenter, loggedIn } = props;

    const [voteCount, setVoteCount] = useState(votes);
    const [voteError, setVoteError] = useState("");

    const vote = async () => {
        const url = `http://localhost:8000/comments/vote`

        const body = {
            commentId
        }

        await axios.post(url, body, config)
            .then((res) => {
                console.log(res.data)
                setVoteCount(parseInt(res.data))
                setVoteError("")
            })
            .catch((err) => {
                console.log(err)
                setVoteError(err?.response?.data)
            })
    }

    return (
        <div className="answer">
            <div className="answerText">
                {formatText(text)}
            </div>
            <div className="ansBy">
                <span className="name">{commenter}</span> commented
            </div>

            <div>{voteCount} upvote{s(voteCount)}</div>

            {loggedIn && (<div>
                <button className="voteBtn" onClick={() => { vote(1) }}> Upvote </button>
                <div className="inputError">{voteError}</div>
            </div>)}

        </div>
    )
}