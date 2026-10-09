import { useState } from "preact/hooks"

export function AuthForm(props: any){
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async(event:Event) => {
		event.preventDefault()
        const route :string = props.isLogin ? '/api/log-in' : '/api/sign-up';
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

    return <>
        {props.isLogin ? <h2>Log In</h2> : <h2>Sign Up</h2>}
        {errorMsg && <p class='centered error'>{errorMsg}</p>}
        <form id="auth-form" onSubmit={handleSubmit}>
            <label for='username'>Username:</label>
            <input type='text' name='username' id="username" autocomplete="username" />

            <label for='password'>Password:</label>
            <input type='password' name='password' id="password" autocomplete={props.isLogin ? "current-password" : "new-password"}/>

            {!props.isLogin && 
            <>
                <label for='password2'>Re-enter password:</label>
                <input type='password' name='password2' id="password2" autocomplete="new-password" />
            </>}
            <button type="submit">{props.isLogin? 'Log In' : 'Sign Up'}</button>
        </form>
        {props.isLogin ?
            <div class='centered-text'>
                No account yet?
                <button class='fake-link' type='button' onClick={props.loadSignUp}>Sign up here!</button>
            </div> 
        :
            <div class='centered-text'>
                <button class='fake-link' type='button' onClick={props.loadLogin}>Return to login page</button>
            </div> 
        }
    </>
}