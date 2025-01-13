from win32gui import GetWindowText, GetForegroundWindow
import keyboard
import os
import sys

path = sys.argv[1]

f = open(f"{path}",'w',encoding='utf-8')
f.close()

def my_callback(event):
    name=event.name
    timestamp=event.time
    event_type=event.event_type
    window =  GetWindowText(GetForegroundWindow())
    lang = "unknown"

    
    if(event_type == "down" and ("Visual Studio Code" in window) ):   
        if(".py" in window): 
            lang = "Python"
        elif(".java" in window): 
            lang = "Java"
        elif(".txt" in window): 
            lang = "Text"
        elif(".css" in window): 
            lang = "CSS"
        elif(".html" in window or ".htm" in window): 
            lang = "HTML"
        elif(".js" in window): 
            lang = "JavaScript"
        elif(".xml" in window): 
            lang = "XML"
        elif(".as" in window): 
            lang = "ActionScript"
        elif(".cpp" in window or ".cc" in window or ".cxx" in window or ".c++" in window): 
            lang = "Cpp"
        elif(".asp" in window or ".aspx" in window): 
            lang = "ASP"
        elif(".c" in window): 
            lang = "C"
        elif(".cs" in window): 
            lang = "C-Sharp"
        elif(".php" in window): 
            lang = "PHP"
        elif(".rb" in window): 
            lang = "Ruby"
        elif(".go" in window): 
            lang = "Go"
        elif(".swift" in window): 
            lang = "Swift"
        elif(".r" in window): 
            lang = "R"
        elif(".pl" in window): 
            lang = "Perl"
        elif(".sh" in window): 
            lang = "ShellScript"
        elif(".bat" in window): 
            lang = "Batch"
        elif(".kt" in window or ".kts" in window): 
            lang = "Kotlin"
        elif(".rs" in window): 
            lang = "Rust"
        elif(".dart" in window): 
            lang = "Dart"
        elif(".lua" in window): 
            lang = "Lua"
        elif(".m" in window): 
            lang = "Objective-C"
        elif(".scala" in window): 
            lang = "Scala"
        elif(".ts" in window): 
            lang = "TypeScript"
        elif(".vb" in window): 
            lang = "VB"
        elif(".ex" in window or ".exs" in window): 
            lang = "Elixir"
        elif(".erl" in window): 
            lang = "Erlang"
        elif(".f90" in window or ".f95" in window): 
            lang = "Fortran"
        elif(".hs" in window): 
            lang = "Haskell"
        elif(".jl" in window): 
            lang = "Julia"
        elif(".rkt" in window): 
            lang = "Racket"
        elif(".clj" in window): 
            lang = "Clojure"
        elif(".ml" in window or ".mli" in window): 
            lang = "OCaml"
        elif(".ps1" in window): 
            lang = "PowerShell"
        elif(".sql" in window): 
            lang = "SQL"
        elif(".tsx" in window): 
            lang = "TypeScript-JSX"
        elif(".jsx" in window): 
            lang = "JavaScript-JSX"
        else: 
            lang = "Unknown"








        if("●" in window):
            sp = window.split("● ")
            window = sp[0] + sp[1]
    # if(event_type == "down"):   
        if(name == '{'): name = "lparan"
        elif(name == '}'): name = "rparan"
        elif(name == ';'): name = "eol"
        elif(name == ','): name = "comma"
        elif(name == '"'): name = "dquote"
        elif(name == "'"): name = "squote"
        log=name + "," + event_type +","+ window+","+lang
        with open(f"{path}",'a',encoding='utf-8') as file:
            file.write('\n'+log)

keyboard.hook(callback=my_callback)
keyboard.wait()