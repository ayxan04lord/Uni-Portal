import './Button.css'

const Button = ({ name, onClick, variant = 'primary', size = 'md', disabled = false, icon }) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {name}
    </button>
  )
}

export default Button
