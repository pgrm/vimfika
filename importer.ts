/// <reference path="./typings/tsd.d.ts" />

import cheerio = require('cheerio');
import rest = require('rest');
import mime = require('rest/interceptor/mime');
import errorCode = require('rest/interceptor/errorCode');
//import _ = require('highland');

var client = rest.wrap(mime).wrap(errorCode);

var hostUrl = 'http://vim.wikia.com';
var listOfEntriesUrl = hostUrl + '/api/v1/Articles/List?expand=1&limit=6';

interface IApiResponse {
    items: IApiArticle[];
}

interface IApiArticle {
    id: number;
    title: string;
    url: string;
    revision: any;
    abstract: string;
    text: string;    
}

export function startImport() {
    client(listOfEntriesUrl).then((response) => {
        var items = (<IApiResponse>response.entity).items;

        items.forEach(fetchAndSaveArticle);
    }, (error) => {
        console.log(error);
    });
}

function fetchAndSaveArticle(article: IApiArticle) {
    if (article.abstract.indexOf('REDIRECT') == 0) {
        return; // this is only a redirect, ignore it.
    }

    console.log('Downloading article ' + article.title);
    client(hostUrl + article.url).then((response) => {
        parseHtmlAndSaveArticle(article, response.entity);
    }, (error) => {
        console.log('Error fetching article ' + article.title);
        console.log(error);
        console.log('Trying again later');

        setTimeout(() => {
            fetchAndSaveArticle(article);    
        }, 1000);    
    })
}

function parseHtmlAndSaveArticle(article: IApiArticle, html: any) {
    var $ = cheerio.load(html);
    var articleHtml = $('#mw-content-text');

    $('noscript', articleHtml).remove();
    $('script', articleHtml).remove();
    $('div>a', articleHtml).remove();
    $('div>b', articleHtml).remove();

    var childElements = articleHtml.children();
    var endOfArticle = childElements.length;

    for (var i = 0; i < childElements.length; i++) {
        if (i > endOfArticle) {
            $(childElements[i]).remove();
        } else if (childElements[i].name == 'h2') {
            var containsHeadline = $('.mw-headline', childElements[i]).length;
            var containsEditSection = $('.editsection', childElements[i]).length;

            if (containsHeadline && containsEditSection) {
                endOfArticle = i;
                $(childElements[i]).remove();
            }
        }
    }

    article.text = articleHtml.text();
    formatTextAndSaveArticle(article);
}

function formatTextAndSaveArticle(article: IApiArticle) {
    //var linesOfText = article.text.match(/[^\r\n]*/g);
    var linesOfText = article.text.split('\n');
    var newLines: string[] = [];
    var lastLineBlank = false;

    console.log(article.text);
    console.log(linesOfText);

    linesOfText.forEach(line => {
        if (line.trim().length) {
            lastLineBlank = false;
            newLines.push(line);
        } else if (!lastLineBlank) {
            lastLineBlank = true;
            newLines.push('');
        }
    });
    article.text = newLines.join('\n');
    console.log(article.text);
}