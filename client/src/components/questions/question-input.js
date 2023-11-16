
export default function QuestionInput(props) {
  const { title, inputId, desc, errorText, inputText, setInputText, textarea } = props
  return (
    <>
      <h1>{title}</h1>
      <p>{desc}</p>
      <p className="inputError">{errorText}</p>

      {textarea ?
        <textarea
          id={inputId}
          onInput={(e) => { setInputText(e.target.value) }} value={inputText} />
        :
        <input type="text"
          id={inputId}
          onInput={(e) => { setInputText(e.target.value) }} value={inputText} />
      }
    </>
  )
}