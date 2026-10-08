import { useRef, useState, useEffect } from "preact/hooks";
export function ShareDialog(props : {user:string}){
    //get the website name
    const link = `${window.location.origin}/user/${props.user}`;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const timerId=useRef<number |undefined | null>(null)
    const [isCopied, setCopied] = useState(false)
    const copyLink = async ()=>{
        try{
            await navigator.clipboard.writeText(link);
            setCopied(true)
        }catch(error:unknown){
            if(error instanceof Error){
                console.error(error.message);
            }
            else{
                console.error("Unknown error", error);
            }
        }
    }

    useEffect(() =>{
        if(isCopied){
            if (timerId.current) clearTimeout(timerId.current);
            timerId.current = setTimeout(()=>{
                setCopied(false)
            }, 5000)
        }
        return () =>{
            if (timerId.current) clearTimeout(timerId.current);
        }
    },[isCopied])
    const openDialog = () =>{
        dialogRef.current?.showModal();
    }
    const closeDialog = ()=>{
        dialogRef.current?.close();
    }
    return (<>
            <button onClick={openDialog}>Share Schedule</button>
            <dialog ref={dialogRef} id='share'>
                <div class='flex'>
                    <button onClick={closeDialog}>X</button>
                </div>
                <p>Want to share your schedule with other users?</p>
                <p>Click 'copy' and send them this link!</p>
                <input type='text' readonly value={link}/> 
                {isCopied ? <button class='copied' onClick={copyLink}>Copied</button>
                    : <button onClick={copyLink}>Copy</button>}
            </dialog>
        </>)
}