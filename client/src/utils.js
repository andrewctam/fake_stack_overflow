export function s(num) {
    if (num === 1)
        return "";

    return "s";
}

export function pad(num) {
    if (num > 10) {
        return "" + num;
    } else {
        return "0" + num;
    }
}

export function formatAskDate(date) {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (now.getFullYear() === date.getFullYear()) {
        if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
            if (now.getHours() === date.getHours()) {
                if (now.getMinutes() === date.getMinutes()) {
                    const secs = now.getSeconds() - date.getSeconds();
                    return `${secs} second${s(secs)} ago`;
                } else {
                    const mins = now.getMinutes() - date.getMinutes()
                    return `${mins} minute${s(mins)} ago`;
                }
            } else {
                const hours = now.getHours() - date.getHours()
                return `${hours} hour${s(hours)} ago`;
            }
        } else {
            return `${months[date.getMonth()]} ${date.getDate()} at ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        }
    } else {
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
}

export function isEmpty(str) {
    return str.length === 0 || str.trim().length === 0;
}


export function parseHyperlink(hyperlink) {
    const bStart = hyperlink.indexOf("[");
    const bEnd = hyperlink.indexOf("]");
    const pStart = hyperlink.indexOf("(");
    const pEnd = hyperlink.indexOf(")");

    if (bStart < 0 || bEnd < 0 || pStart < 0 || pEnd < 0)
        return undefined;

    return {
        text: hyperlink.substring(bStart + 1, bEnd),
        url: hyperlink.substring(pStart + 1, pEnd)
    }
}

export function extractHyperlinks(text) {
    const matches = text.match(/\[.*?\]\(.*?\)/g);
    if (!matches)
        return [];

    return matches.map((m) => parseHyperlink(m));
}

export function verifyHyperlinks(text) {
    const hyperlinks = extractHyperlinks(text);
    
    for (const link of hyperlinks) {
        if (!link ||
            //link.text === "" ||
            link.url === "" ||
            (!link.url.startsWith("http://") && !link.url.startsWith("https://"))) {
            return false;
        }
    }

    return true;
}

export function formatText(text) {
    const fragments = text.split(/\[.*?\]\(.*?\)/g)
    const hyperlinks = extractHyperlinks(text);

    const formatted = [];

    for (let i = 0; i < fragments.length - 1; i++) {
        const url = hyperlinks[i]?.url;
        const urlTxt = hyperlinks[i]?.text;

        formatted.push(<span key={`span ${i}`}> {fragments[i]} </span>);
        formatted.push(<a key={`a ${i}`} target="_blank" rel="noreferrer" href={url}> {urlTxt} </a>);
    }

    formatted.push(<span key={`last span`}> {fragments[fragments.length - 1]} </span>);

    return formatted;

}

export const config = { 
    withCredentials: true
}