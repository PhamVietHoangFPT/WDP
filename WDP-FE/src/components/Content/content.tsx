import './content.css'
import { useNavigate } from 'react-router-dom'

interface ContentProps {
  title: string
  btnContent?: string
  linkURL?: string
}

export default function Content({ title, btnContent, linkURL }: ContentProps) {
  const navigate = useNavigate()

  return (
    <div className='contentBar'>
      <h1>{title}</h1>

      {btnContent && linkURL && (
        <button
          className='todo-button'
          onClick={() => {
            navigate(linkURL)
          }}
        >
          {btnContent}
        </button>
      )}
    </div>
  )
}
