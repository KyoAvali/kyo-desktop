import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
    selector: 'app-terminal',
    imports: [CommonModule, FormsModule],
    templateUrl: './terminal.html',
    styleUrl: './terminal.scss'
})
export class TerminalComponent implements OnInit {
    @ViewChild('terminalContent') terminalContent!: ElementRef;

    outputLines: string[] = [];
    currentInput = '';
    currentDir = '~';
    commandHistory: string[] = [];
    historyIndex = -1;

    private commands: Record<string, (args: string[]) => string[]> = {
        help: () => [
            'Available commands:',
            '  help          - Show this help message',
            '  clear         - Clear terminal',
            '  echo [text]   - Print text to terminal',
            '  date          - Show current date',
            '  whoami        - Show current user',
            '  ls            - List files',
            '  pwd           - Print working directory',
            '  cat [file]    - Display file contents',
            '  finder [file] - Open Finder dialog, optionally with file parameter',
            '  uname         - Show system info'
        ],
        clear: () => {
            this.outputLines = [];
            return [];
        },
        echo: (args) => [args.join(' ')],
        date: () => [new Date().toString()],
        whoami: () => ['user'],
        ls: () => ['Documents  Downloads  Pictures  Music  Videos'],
        pwd: () => [this.currentDir],
        cat: (args) => {
            if (!args.length) return ['Usage: cat <filename>'];
            return [`Mock contents of ${args[0]}`];
        },
        finder: (args) => {
            if (!args.length) {
                this.dialogService.openFinder();
                return ['Opening Finder...'];
            } else {
                const target = args[0];
                // Check if it looks like a path (contains /) or a file (has extension)
                if (target.includes('/') || target.includes('.')) {
                    // Try to determine if it's a folder or file
                    if (target.includes('.')) {
                        // Looks like a file, open file preview
                        this.dialogService.openPreview({
                            name: target,
                            type: this.getFileType(target),
                            url: `/files/${target}`
                        });
                        return [`Opening file: ${target}`];
                    } else {
                        // Looks like a folder, open Finder at that folder
                        this.dialogService.openFinder(target);
                        return [`Opening Finder at: ${target}`];
                    }
                } else {
                    // Default to folder
                    this.dialogService.openFinder(target);
                    return [`Opening Finder at: ${target}`];
                }
            }
        },
        uname: () => ['KyoOS 1.0.0 (Desktop)']
    };

    constructor(private dialogService: DialogService) {}

    ngOnInit() {
        this.outputLines = [
            'Welcome to KyoOS Terminal',
            'Type "help" for available commands.\n'
        ];
    }

    executeCommand() {
        const input = this.currentInput.trim();
        if (!input) return;

        this.commandHistory.push(input);
        this.historyIndex = this.commandHistory.length;

        this.outputLines.push(`user@kyo:${this.currentDir}$ ${input}`);

        const [cmd, ...args] = input.split(/\s+/);
        const handler = this.commands[cmd.toLowerCase()];

        if (handler) {
            const output = handler(args);
            this.outputLines.push(...output);
        } else {
            this.outputLines.push(`Command not found: ${cmd}`);
        }

        this.outputLines.push('');
        this.currentInput = '';

        setTimeout(() => this.scrollToBottom());
    }

    navigateHistory(direction: number) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;

        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.currentInput = '';
            return;
        }

        this.currentInput = this.commandHistory[this.historyIndex];
    }

    navigateCommand(direction: number) {
        this.navigateHistory(direction);
    }

    private getFileType(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['html', 'htm'].includes(ext)) return 'html';
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
        return 'text';
    }

    private scrollToBottom() {
        if (this.terminalContent) {
            const el = this.terminalContent.nativeElement;
            el.scrollTop = el.scrollHeight;
        }
    }
}
