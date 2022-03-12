use std::env;
use std::path::Path;
use std::io::{self, BufReader};
use std::io::prelude::*;
use std::fs::File;
use regex::Regex;

fn help () {
  println!("usage: logfile <string>");
}

fn main () {
  let args: Vec<String> = env::args().collect();

  match args.len() {
    // No arguments passed
    2 => {  
      let ref filearg = &args[1];
      open_file(filearg.to_string());
      //open_file();
    },
    _ => { help() }
  }
}

fn open_file(file_name:String) -> io::Result<()>  {
  let path = Path::new(&file_name);
  let display = path.display();

  let f = match File::open(&path) {
    Err(e) => panic!("couldn't open {}: {}", display, e),
    Ok(file) => file,
  };
  let mut f = BufReader::new(f);
  

  loop {
    let mut buf = String::new();
    let num_b = f.read_line(&mut buf)?;
    println!("{}", buf);
    buf.clear();

    if num_b == 0 {
        println!("EOF reached");
        break;
    }

    /*if num_b.as_ref().unwrap().to_string() == "0" {
      println!("slut {}", num_b.as_ref().unwrap().to_string());
      break;
    }*/

  }

  Ok(())
}