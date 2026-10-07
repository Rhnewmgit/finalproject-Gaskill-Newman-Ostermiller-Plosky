import { useState } from "preact/hooks"

export function AuthForm(props){
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async(event:Event) => {
		event.preventDefault()
        const route :string = props.isLogin ? '/api/log-in' : '/api/sign-up';
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

    return <>
        {props.isLogin ? <h2>Log In</h2> : <h2>Sign Up</h2>}
        <form id="auth-form" onSubmit={handleSubmit}>
            <label for='username'>Username:</label>
            <input type='text' name='username'/>

            <label for='password'>Password:</label>
            <input type='password' name='password'/>

            {!props.isLogin && 
            <>
                <label for='password2'>Re-enter password:</label>
                <input type='password' name='password2'/>
            </>}
            <button type="submit">{props.isLogin? 'Log In' : 'Sign Up'}</button>
        </form>
        {props.isLogin ?
            <auth-link>
                No account yet?
                <button class='fake-link' type='button' onClick={props.signUp}>Sign up here!</button>
            </auth-link> 
        :
            <auth-link>
                <button class='fake-link' type='button' onClick={props.login}>Return to login page</button>
            </auth-link>
        }   
        <p class='margin error'> {errorMsg}</p>
    </>
}