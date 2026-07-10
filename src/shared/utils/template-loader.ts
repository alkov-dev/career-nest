import * as fs from 'fs';
import * as path from 'path';

export function loadTemplate(templateName: string, variables: Record<string, string>): string {

    const templatePath = path.join(process.cwd(), 'src', 'shared', 'templates', `${templateName}.html`);

    let html = fs.readFileSync(templatePath, 'utf-8');

    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
    });

    return html;
}