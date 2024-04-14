import React from "react";
import BoxList from "../components/boxList";
import logo from '../assets/logo.png';

function Home() {
    return <>
        <img src={logo}  alt={""}/>
        <BoxList list={[]} loading={false}></BoxList>
    </>;
}

export default Home;