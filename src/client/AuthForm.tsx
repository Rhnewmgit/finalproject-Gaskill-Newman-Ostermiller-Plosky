import { useState } from "preact/hooks"

export function AuthForm(props : {onLogin: Function}){
    const [isLoginMode, setLoginMode] = useState(true)
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async(event:Event) => {
		event.preventDefault()
        const route :string = isLoginMode ? '/api/log-in' : '/api/sign-up';
        const authForm = event.currentTarget as HTMLFormElement;
        const formData:FormData = new FormData(authForm)
        console.log(formData)
        const formEntries  = Object.fromEntries(formData)
        console.log(formEntries)
        console.log(JSON.stringify(formEntries))
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
        {isLoginMode ? <h1 class='margin'>Log In</h1> : <h1 class='margin'>Sign Up</h1>}
        <form class='margin' id="auth-form" onSubmit={handleSubmit}>
            <label class='login-field' for='username'>Username: </label>
            <input class='login-field' type='text' name='username'/>

            <label class='login-field' for='password'>Password: </label>
            <input class='login-field' type='password' name='password'/>

            {!isLoginMode && 
            <>
                <label class='login-field' for='password2'>Re-enter password: </label>
                <input class='login-field' type='password' name='password2'/>
            </>}
            <button class='submit' type="submit">{isLoginMode? 'Log In' : 'Sign Up'}</button>
        </form>
        {isLoginMode ?
            <>
                <p class='inline margin'>No account yet?</p>
                <button class='fake-link' type = 'button' onClick={handleClick}>Sign up here!</button>
            </> 
        :
            <button class='margin fake-link' type='button' onClick={handleClick}>Return to login page</button>
        }   
        <p> {errorMsg}</p>
    </>
}