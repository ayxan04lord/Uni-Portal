import './Spinner.css'

const Spinner = ({ fullscreen }) => (
  <div className={`spinner-wrap ${fullscreen ? 'spinner-wrap--full' : ''}`}>
    <div className="spinner" />
  </div>
)

export default Spinner
