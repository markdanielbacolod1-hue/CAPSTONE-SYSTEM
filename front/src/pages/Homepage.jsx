import { useState } from "react"
function Homepage () {
    const [current, setCurrent] = useState('home')
    const currentStyle = "text-[#F57696] font-bold"
    const notCurrent = "text-white font-bold"

    return (
        <div>
            <div id="head">
                <div className="bg-black p-3 flex gap-4 justify-between">
                    <div className="flex gap-5 items-center">
                        <div className="bg-[url('/image-removebg-preview.png')] rounded-lg w-10 h-10 bg-center bg-cover rounded"></div>
                        <div className="text-white text-sm font-bold object-center">UEP BSHM</div>
                    </div>
                    <div className="flex gap-10">
                        <button className={current == "home" ? currentStyle : notCurrent} onClick={()=>setCurrent('home')}>HOME</button>
                        <button className={current == "recipe" ? currentStyle : notCurrent} onClick={()=>setCurrent('recipe')}>RECIPES</button>
                    </div>
                    <div>
                        <div className="bg-white py-1.5 px-5 rounded-lg shadow-[2px_2px_0_#F57696] mx-4">
                            <button className="font-bold text-sm">LOG IN</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="body" className="bg-[#F57696] pb-5 flex">
                <div className="pt-30 pl-20">
                    <div className="text-sm font-extrabold">UEP BSHM</div>
                    <div className="text-8xl font-extrabold">Welcome!</div>
                    <div className="text-7xl font-extrabold">HM <span className="text-white">STUDENTS</span></div>
                    <div className="font-semibold mt-5 w-150">Web-based Culinary Archive and Recipe Repository System for
                    the UEP Hospitality Management program.</div>
                    <div className="flex gap-10 mt-5">
                        <button className="bg-black rounded-lg font-semibold text-white py-2 shadow-[3px_3px_0_white] px-5">Continue</button>
                        <button className="bg-white outline-black border-2 shadow-[3px_3px_0_#111] rounded-lg font-semibold text-black py-2 px-5">Browse Recipes</button>
                    </div>
                </div>
                <div>
                    <div className="p-5 border-[#E62D86] border-10 bg-[#FFADD0] rounded-full ml-70 mt-20">
                        <div className=" bg-[#F57696] rounded-full m-2 border-dashed border-5 border-white">
                            <div className="bg-[url('/image-removebg-preview.png')] h-80 w-80 bg-cover bg-center"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Homepage