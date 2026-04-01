#!/usr/bin/env swift

import AppKit

let input = FileHandle.standardInput.readDataToEndOfFile()
guard let html = String(data: input, encoding: .utf8) else {
    fputs("Error: could not read HTML from stdin\n", stderr)
    exit(1)
}

let pasteboard = NSPasteboard.general
pasteboard.clearContents()
pasteboard.setString(html, forType: .html)
