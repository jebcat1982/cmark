#ifndef CMARK_AST_H
#define CMARK_AST_H

#include <stdio.h>
#include "node.h"
#include "buffer.h"

#ifdef __cplusplus
extern "C" {
#endif

#define MAX_LINK_LABEL_LENGTH 1000

struct cmark_parser {
	struct cmark_reference_map *refmap;
	struct cmark_node* root;
	struct cmark_node* current;
	int line_number;
	bufsize_t offset;
	bufsize_t first_nonspace;
	int indent;
	bool blank;
	cmark_strbuf *curline;
	bufsize_t last_line_length;
	cmark_strbuf *linebuf;
	int options;
};

#ifdef __cplusplus
}
#endif

#endif
