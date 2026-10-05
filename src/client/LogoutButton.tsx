//it's own module so we can just fit it in wherever when we get to the layout changes
export function LogoutButton(props : {onLogout: Function}){
    
    const handleSubmit = async(event : Event) =>{
        event.preventDefault()
        fetch( '/api/log-out', {
      		method:'POST',
      		headers: { 'Content-Type': 'application/json' }
    	}).then(response => response.json())
    		.then(json => {
      		props.onLogout(null)
    	})	
    }

    return (
        <form onSubmit={handleSubmit}>
            <button type='submit'>Log Out</button>
        </form>
    )
}