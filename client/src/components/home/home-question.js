import { formatAskDate, s } from "../../utils";


export default function HomeQuestion(props) {
  const { q, viewQuestion } = props;

  return (
    <div className="question">
      <div className="stats">
        <div> {`${q.answersCount} answer${s(q.answersCount)}`}</div>
        <div> {`${q.views} view${s(q.views)}`} </div>
      </div>

      <div className="info">
        <h2 id={q._id} onClick={() => viewQuestion(q._id)}> {q.title} </h2>
        <div>
          {q.tags.map(name =>
            <div className="tagBox" key={"TAG" + name}>
              {name}
            </div>
          )}
        </div>
      </div>

      <div className="askedBy">
        <span className="name">{q.asked_by}</span> asked {formatAskDate(new Date(q.ask_date_time))}
      </div>
    </div>
  )

}