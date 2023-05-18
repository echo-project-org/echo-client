import '../index.css'

const Header = ({title}) => {
    return (
        <header className='header'>
            <h1 className='title noselect'>{title}</h1>
        </header>
    )
}

Header.defaultProps = {
    title : 'Echo'
}

export default Header