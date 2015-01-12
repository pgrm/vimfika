/// <reference path="./typings/tsd.d.ts" />

import cheerio = require('cheerio');
import rest = require('rest');
import mime = require('rest/interceptor/mime');
import errorCode = require('rest/interceptor/errorCode');
import mongoose = require('mongoose');

import model = require('./server/model.vimtip');

var htmlToText = require('html-to-text');

var client = rest.wrap(mime).wrap(errorCode);

var hostUrl = 'http://vim.wikia.com';
var listOfEntriesUrl = hostUrl + '/api/v1/Articles/List?expand=1&limit=10000';

interface IApiResponse {
    items: IApiArticle[];
}

interface IApiArticle extends model.IVimTip {
    abstract: string;
}

export function startImport() {
    client(listOfEntriesUrl).then((response) => {
        var items = (<IApiResponse>response.entity).items;

        //items.forEach(fetchAndSaveArticle);
        safelyFetschAllArticles(items, fetchAndSaveArticle);
    }, (error) => {
        console.log(error);
    });
}

function safelyFetschAllArticles(items: IApiArticle[], cb: (article: IApiArticle) => void) {
    var article = getNextFullArticle(items);

    if (article) {
        cb(article);
        setTimeout(() => {
            safelyFetschAllArticles(items, cb);    
        }, 100);
    }
}

function fetchAndSaveArticle(article: IApiArticle) {
    console.log('Downloading article ' + article.title);
    client(hostUrl + article.url).then((response) => {
        if (response.status.code == 404) {
            console.log('WARNING: Page ' + hostUrl + article.url + ' could not be found');
        } else {
            parseHtmlAndSaveArticle(article, response.entity);
        }
    }, (error) => {
        console.log('Error fetching article ' + article.title);
        console.log(error);
        console.log('Trying again later');

        setTimeout(() => {
            fetchAndSaveArticle(article);    
        }, 10000);    
    })
}

function parseHtmlAndSaveArticle(article: IApiArticle, html: string) {
    var articleHtml = parseAndFilterHtml(html);

    article.text = htmlToText.fromString(articleHtml.html(), {hideLinkHrefIfSameAsText: true, linkHrefBaseUrl: hostUrl, tables: true});
    article.baseUrl = hostUrl;
    saveVimTipToDb(article);
}

function getNextFullArticle(items: IApiArticle[]): IApiArticle {
    var obsoleteTipsTitleSchema = /^VimTip\d+$/;
    var article: IApiArticle = null;

    while (!article && items && items.length) {
        article = items.pop();

        if (isOnlyRedirectArticle(article)) {
            article = null;
        } else if (obsoleteTipsTitleSchema.test(article.title)) {
            article = null;
        }
    }

    return article;
}

function parseAndFilterHtml(html: string): Cheerio {
    var $ = cheerio.load(html);
    var parsedArticle = $('#mw-content-text');

    deleteByIdPersistently($, 'delete', parsedArticle);
    deleteByIdPersistently($, 'News', parsedArticle);
    $('noscript', parsedArticle).remove();
    $('script', parsedArticle).remove();
    $('div>a', parsedArticle).remove();
    $('div>b', parsedArticle).remove();
    $('.editsection', parsedArticle).remove();
    $('.toctoggle', parsedArticle).remove();
    $('nav', parsedArticle).remove();

    return parsedArticle;
}

function deleteByIdPersistently($: CheerioStatic, id: string, element: Cheerio) {
    var item: Cheerio;
    
    if (id.indexOf('#') != 0) {
        id = '#' + id;
    }
    do {
        $(id, element).remove();
        item = $(id, element);
    } while(item && item.length);
}

function saveVimTipToDb(article: model.IVimTip) {
    var vimTip = new model.VimTip(article);

    console.log('Saving article ' + article.title);
    vimTip.save((err, res: model.IVimTip) => {
        if (err) {
            console.log('Error saving article ' + article.title);
            console.log(err);
            console.log('Trying again later');

            setTimeout(() => {
                saveVimTipToDb(article);    
            }, 10000);    
        } else {
            console.log('Article ' + res.title + ' saved successfully with the id ' + res._id);
        }
    });
}

function isOnlyRedirectArticle(article: IApiArticle): boolean {
    return article.abstract.indexOf('REDIRECT') == 0;
}