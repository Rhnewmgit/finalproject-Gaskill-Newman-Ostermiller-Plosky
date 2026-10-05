import { useState } from "preact/hooks"

export function AuthForm(props : {onLogin: Function}){
    const [isLoginMode, setLoginMode] = useState(true)
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async(event:Event) => {
		event.preventDefault()
        const route :string = isLoginMode ? '/api/log-in' : '/api/sign-up';
        const authForm = event.currentTarget as HTMLFormElement;
        const formData:FormData = new FormData(authForm)

        const formEntries  = Object.fromEntries(formData)
		const json = await fetch( route, {
            method:'POST',
            body: JSON.stringify(formEntries),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        if(json.success){
            props.onLogin(json.user)
        }else{
            setErrorMsg(json.error)
        }
	}
    function handleClick(event: MouseEvent): void {
        setLoginMode(!isLoginMode)
    }

    return <>
        {isLoginMode ? <h1>Log In</h1> : <h1>Sign Up</h1>}
        <form id="auth-form" onSubmit={handleSubmit}>
            <label for='username'>Username: </label>
            <input type='text' name='username'/>

            <label for='password'>Password: </label>
            <input type='text' name='password'/>

            {!isLoginMode && 
            <>
                <label for='password2'>Re-enter password: </label>
                <input type='text' name='password2'/>
            </>}
            <button type="submit">{isLoginMode? 'Log In' : 'Sign Up'}</button>
        </form>
        {isLoginMode ?
            <>
                <p>No account yet?</p>
                <button type = 'button' onClick={handleClick}>Sign up here!</button>
            </> 
        :
            <button type = 'button' onClick={handleClick}>Return to login page</button>
        }   
        <p> {errorMsg}</p>
    </>
}