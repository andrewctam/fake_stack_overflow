import { useState } from "react";
import { config, formatAskDate, formatText, s } from "../../utils"
import axios from "axios";
import CommentList from "../comments/comment-list";

export default function Answer(props) {
    const { aid, text, ans_by, ans_date_time, votes, loggedIn, comments } = props

    const [voteCount, setVoteCount] = useState(votes);
    const [voteError, setVoteError] = useState("");

    const vote = async (num) => {
        const url = `http://localhost:8000/answers/vote`

        const body = {
            aid,
            upvote: num > 0
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
                <div className="ansText">{formatText(text)}</div>
                <CommentList
                    comments={comments}
                    parentType="Answer"
                    loggedIn={loggedIn}
                    id={aid}
                />

            </div>
            <div className="ansBy">
                <span className="name">{ans_by}</span> answered {formatAskDate(new Date(ans_date_time))}
                <div>{voteCount} vote{s(voteCount)}</div>
            </div>



            {loggedIn && (<div>
                <button className="voteBtn" onClick={() => { vote(1) }}> Upvote </button>
                <button className="voteBtn" onClick={() => { vote(-1) }}> Downvote </button>
                <div className="inputError">{voteError}</div>
            </div>)}

        </div>
    )
}