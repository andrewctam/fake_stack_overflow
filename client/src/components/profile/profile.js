import axios from "axios";
import { useEffect, useState } from "react";
import { config, formatAskDate, s } from "../../utils";
import ProfileTag from "./profile-tag";

export default function Profile(props) {
    const { username, editQuestion, viewQuestionUserFirst, viewHome } = props;

    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState("")

    useEffect(() => {
        const getProfile = async () => {
            const url = `http://localhost:8000/users/profile/${username}`;

            await axios.get(url, config)
                .then((res) => {
                    console.log(res)
                    setUserInfo(res.data)
                })
                .catch((err) => {
                    setError(err?.response?.data)
                    console.log(err)
                });
        }

        getProfile();
    }, [])

    if (!userInfo) return null;

    return (<div className="profile">
        <div className="userStats">
            <div>{username}'s Profile</div>
            <div>Reputation: {userInfo.reputation}</div>
            <div>Member Since: {formatAskDate(new Date(userInfo.joinDate))}</div>
        </div>

        <h2>Questions Posted by {username}</h2>
        <ul id="questionsList" className="questionsList">
            {userInfo.questions.map(q =>
                <li className="profileTitle" key={q._id} onClick={() => { editQuestion(q) }}>
                    {q.title}
                </li>
            )}

            {userInfo.questions.length === 0 && <div>No Questions Posted</div>}
        </ul>

        <h2>Questions Answered by {username}</h2>
        <ul id="questionsList" className="questionsList">
            {userInfo.questionsAnswered.map(q =>
                <li className="profileTitle" key={q._id} onClick={() => { viewQuestionUserFirst(q._id, username) }}>
                    {q.text}
                </li>
            )}

            {userInfo.questionsAnswered.length === 0 && <div>No Questions Answered</div>}
        </ul>

        <h2>Tags Created by {username}</h2>
        <div className="tags">
            {userInfo.tags.map(t =>
                <ProfileTag
                    key={t._id}
                    tid={t._id}
                    name={t.name}
                    count={t.count}
                    viewHome={viewHome}
                />)}
        </div>
        {userInfo.tags.length === 0 && <ul><div>No Tags Created</div></ul>}
    </div>
    )

}