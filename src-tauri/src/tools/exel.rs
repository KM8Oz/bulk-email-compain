use std::{fmt::format, path::{Path, PathBuf}};

use tauri::utils::resources;
use umya_spreadsheet::*;
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Data {
    pub date: String,
    pub array: Vec<(String,String,String,String)>
}

pub fn export_to_xlsx(json: Data, path: String, resources: PathBuf){
    let msg =  "can't read this dir!";
    let _path = resources.as_path();
    let mut export_path = std::path::Path::new(path.as_str()).to_path_buf();
    // let mut extra_path = path.clone();
    let extra_path = format!("{}.xlsx",path.to_string());
    let export_path_all = std::path::Path::new(&extra_path);
    let mut template_book = umya_spreadsheet::reader::xlsx::read(_path).unwrap();
    let date = json.date.as_str();
    // set data in the header
    let sheet =  template_book.get_active_sheet_mut();
    sheet.get_cell_mut("C6").set_value(date);
    let mut i = 9;
    for (a,e,h,k) in json.array {
      // AEHK
        let color =  match e.as_str() {
          "Safe" => umya_spreadsheet::Color::COLOR_GREEN,
          "Risky" => umya_spreadsheet::Color::COLOR_YELLOW,
          "Invalid" => umya_spreadsheet::Color::COLOR_RED,
          _ => umya_spreadsheet::Color::COLOR_RED
        };
        let mut font = umya_spreadsheet::Font::default();
        font.set_bold(true);
        sheet.get_cell_mut(format!("A{}", i).as_str()).set_value(a)
        .get_style_mut().set_font(font.clone());
        sheet.get_cell_mut(format!("E{}", i).as_str()).set_value(e).get_style_mut().set_background_color(
          color
        ).set_font(font.clone());
        sheet.get_cell_mut(format!("H{}", i).as_str()).set_value(h).get_style_mut().set_font(font.clone());
        sheet.get_cell_mut(format!("K{}", i).as_str()).set_value(k).get_style_mut().set_font(font.clone());
        i += 1;
    }
    let extension_parsed =  match export_path.extension() {
        Some(m)=> m.to_str(),
        None => {
            let _ = export_path.set_extension("xlsx");
            Some("xlsx")
        },
    }; 
    match extension_parsed.unwrap() {
        "xlsx" => {
            println!("{:?}", export_path);
            let _ = umya_spreadsheet::writer::xlsx::write(&template_book, export_path);
        },
        "csv" => {
            let mut option = structs::CsvWriterOption::default();
            option.set_csv_encode_value(structs::CsvEncodeValues::ShiftJis);
            option.set_do_trim(true);
            option.set_wrap_with_char("\"");
            let _ = writer::csv::write(&template_book, export_path, Some(&option));
        },
        _ => {
            let _ = umya_spreadsheet::writer::xlsx::write(&template_book, export_path_all);
        }
    }
    
}
