import axios from "axios";
import { useEffect, useState } from "react";
import { config, formatAskDate } from "../../utils";
import ProfileTag from "./profile-tag";
import UserItem from "./user-item";

export default function Profile(props) {
    const { username, editQuestion, viewQuestionUserFirst, viewHome } = props;

    const [user, setUser] = useState(username);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState("")

    useEffect(() => {
        const getProfile = async () => {
            const url = `http://localhost:8000/users/profile/${user}`;

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
    }, [user])

    if (error) return <div>{error}</div>
    if (!userInfo) return null;

    const sortQuestions = (a, b) => (a.ask_date_time < b.ask_date_time ? 1 : -1);
    return (<div className="profile">
        <div className="userStats">
            <div>{user}'s Profile</div>
            <div>Reputation: {userInfo.reputation}</div>
            <div>Member Since: {formatAskDate(new Date(userInfo.joinDate))}</div>
        </div>

        {userInfo.isAdmin ? (<>
            <h2>Users List</h2>
            <ul>
                {userInfo.users.map((user) => (
                    <UserItem
                        username={user}
                        setUser={setUser}
                    />
                ))}

                {userInfo.users.length === 0 && <div>No Users</div>}
            </ul>
        </>) : (<>
            <h2>Questions Posted by {user}</h2>
            <ul id="questionsList" className="questionsList">
                {userInfo.questions.sort(sortQuestions).map(q =>
                    <li className="profileTitle" key={q._id} onClick={() => { editQuestion(q) }}>
                        {q.title}
                    </li>
                )}

                {userInfo.questions.length === 0 && <div>No Questions Posted</div>}
            </ul>

            <h2>Questions Answered by {user}</h2>
            <ul id="questionsList" className="questionsList">
                {userInfo.questionsAnswered.sort(sortQuestions).map(q =>
                    <li className="profileTitle" key={q._id} onClick={() => { viewQuestionUserFirst(q._id, user) }}>
                        {q.text}
                    </li>
                )}

                {userInfo.questionsAnswered.length === 0 && <div>No Questions Answered</div>}
            </ul>

            <h2>Tags Created by {user}</h2>
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
        </>)
        }
    </div>
    )

}